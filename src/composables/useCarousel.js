import {ref, unref, watch} from "vue";
import {degreetoRadians} from "../utils/utils";

const hexagonWidth = h => 1.95 * h;
const activeItemIndex = ref(2);
let items = [];
let _defaultX = 0;
let _defaultY = 0;
const DEFAULT_TRANSFORM = 'translate(0px, 0px)';
const DTOStyle = (transform, opacity) => ({
    transform: unref(transform),
    opacity: unref(opacity),
});
export const useCarousel = ({beforeIndexUpdate}) => {
    const isActive = i => i === activeItemIndex.value;
    const isSmall = i => Math.abs(i - activeItemIndex.value) > 1;
    const isOutVisible = i => !(Math.abs(i - activeItemIndex.value) > 2);
    const calcX = f1 => _defaultX / 2 + f1 + _defaultX / 2;
    const getStyle = index => {
        const item = items.find(item => item.index === index);
        if (item) return DTOStyle(item.transform, item.opacity)
        const transform = ref(DEFAULT_TRANSFORM);
        const opacity = ref(1);
        items.push({transform, opacity, index});
        return DTOStyle(transform, opacity)
    }
    const calcPosition = _items => {
        _items.reduce(({deltaXAcc, deltaYAcc}, item) => {
            const direction = activeItemIndex.value > item.index ? 1 : -1;
            const calculatedX = calcX(deltaXAcc);
            const x = direction * calculatedX * -1;
            const y = x * -1 * Math.sin(degreetoRadians(36));
            item.transform.value = `translate(${x}px, ${y}px)`;
            item.opacity.value = +isOutVisible(item.index);
            deltaXAcc += item.widthHex;
            deltaYAcc += item.height;
            return {deltaXAcc, deltaYAcc};
        }, {deltaXAcc: 0, deltaYAcc: 0})
    }
    const setStyles = () => {
        const item = items.find(item => isActive(item.index));
        item.transform.value = DEFAULT_TRANSFORM
        const tail = items.slice(0, item.index);
        const head = items.slice(item.index + 1);
        calcPosition(tail.reverse())
        calcPosition(head)
    }
    watch(activeItemIndex, () => setStyles())
    const setRefs = (itemRefs) => {
        items = itemRefs.map((el, i) => {
            const {transform, index, opacity} = items.find(({index}) => i === index)
            const widthHex = hexagonWidth(el.offsetWidth);
            if (isActive(index)) {
                _defaultX = widthHex
                _defaultY = el.offsetHeight
            }
            return {
                index,
                el,
                width: el.offsetWidth,
                height: el.offsetHeight,
                widthHex,
                transform,
                opacity
            }
        })
        setStyles()
    };
    const setItem = i => {
        if(activeItemIndex.value === i) return;
        beforeIndexUpdate()
        activeItemIndex.value = i;
    }
    return {
        isActive,
        isSmall,
        getStyle,
        activeIndex: activeItemIndex,
        setRefs,
        setItem,
        items,
        increment: () =>
            activeItemIndex.value + 1 < items.length
                ? (beforeIndexUpdate(), setItem(activeItemIndex.value + 1))
                : false
        ,
        decrement: () =>
            activeItemIndex.value + 1 > 1
                ? (beforeIndexUpdate(), setItem(activeItemIndex.value - 1))
                : false,
    }
}
