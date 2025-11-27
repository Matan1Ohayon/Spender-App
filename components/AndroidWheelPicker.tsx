import { scaleFont, scaleSize } from "@/utils/scale";
import { useEffect, useMemo, useRef } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from "react-native";

type ItemShape = {
    value: string;
    label: string;
    emoji?: string;
};

interface AndroidWheelPickerProps {
    items: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    visible?: boolean;
    labelFormatter?: (value: string) => string;
}

const ITEM_HEIGHT = scaleSize(48);
const WHEEL_VISIBLE_ITEMS = 5;
const PADDED_ROWS = 2;
const CENTER_OFFSET = Math.floor(WHEEL_VISIBLE_ITEMS / 2);

function extractEmojiParts(content: string, fallback: string) {
    const trimmed = content?.trim?.() ?? "";
    if (!trimmed) {
        return { emoji: undefined, text: fallback };
    }
    const firstCodePoint = trimmed.codePointAt(0);
    const isEmoji =
        firstCodePoint !== undefined &&
        (firstCodePoint >= 0x1f300 ||
            (firstCodePoint >= 0x2600 && firstCodePoint <= 0x27bf) ||
            firstCodePoint === 0xfe0f);

    if (!isEmoji) {
        return { emoji: undefined, text: trimmed };
    }

    const emoji = String.fromCodePoint(firstCodePoint);
    const remaining = trimmed.slice(emoji.length).trim();
    return {
        emoji,
        text: remaining.length > 0 ? remaining : fallback,
    };
}

export default function AndroidWheelPicker({
    items,
    selectedValue,
    onValueChange,
    visible,
    labelFormatter,
}: AndroidWheelPickerProps) {
    const data: ItemShape[] = useMemo(() => {
        return items.map((value) => {
            const formatted = labelFormatter ? labelFormatter(value) : value;
            const safeLabel =
                typeof formatted === "string" && formatted.trim().length > 0 ? formatted : value;
            const parts = extractEmojiParts(safeLabel, value);
            return {
                value,
                label: parts.text,
                emoji: parts.emoji,
            };
        });
    }, [items, labelFormatter]);

    const paddedData = useMemo(
        () => [
            ...Array(PADDED_ROWS).fill(null),
            ...data,
            ...Array(PADDED_ROWS).fill(null),
        ],
        [data]
    );

    const selectedIndex = Math.max(0, data.findIndex((item) => item.value === selectedValue));
    const listRef = useRef<FlatList<ItemShape>>(null);

    function getOffsetForDataIndex(index: number) {
        const paddedIndex = index + PADDED_ROWS;
        const targetTopIndex = paddedIndex - CENTER_OFFSET;
        const maxTopIndex = Math.max(paddedData.length - WHEEL_VISIBLE_ITEMS, 0);
        const clampedTopIndex = Math.min(Math.max(targetTopIndex, 0), maxTopIndex);
        return clampedTopIndex * ITEM_HEIGHT;
    }

    function scrollToDataIndex(index: number, animated = false) {
        const offset = getOffsetForDataIndex(index);
        listRef.current?.scrollToOffset({
            offset,
            animated,
        });
    }

    useEffect(() => {
        if (!visible) {
            return;
        }

        requestAnimationFrame(() => {
            if (selectedIndex >= 0) {
                scrollToDataIndex(selectedIndex, false);
            }
        });
    }, [selectedIndex, visible]);

    function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const offsetY = event.nativeEvent.contentOffset.y;
        const topIndex = Math.round(offsetY / ITEM_HEIGHT);
        const centerIndex = topIndex + CENTER_OFFSET;
        const dataIndex = Math.min(Math.max(centerIndex - PADDED_ROWS, 0), data.length - 1);
        const nextValue = data[dataIndex]?.value;

        if (nextValue) {
            if (nextValue !== selectedValue) {
                onValueChange(nextValue);
            }
            requestAnimationFrame(() => {
                scrollToDataIndex(dataIndex, true);
            });
        }
    }

    return (
        <View style={styles.wheelWrapper}>
            <FlatList
                ref={listRef}
                data={paddedData}
                keyExtractor={(_, index) => `wheel-item-${index}`}
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
                bounces={false}
                onMomentumScrollEnd={handleScrollEnd}
                getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
                renderItem={({ item }) => {
                    if (!item) {
                        return <View style={styles.wheelItem} />;
                    }
                    const isActive = item.value === selectedValue;
                    return (
                        <View style={styles.wheelItem}>
                            <View style={styles.labelRow}>
                                {item.emoji && (
                                    <Text style={[styles.wheelText, styles.emoji, isActive && styles.wheelTextActive]}>
                                        {item.emoji}
                                    </Text>
                                )}
                                <Text style={[styles.wheelText, isActive && styles.wheelTextActive]}>{item.label}</Text>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wheelWrapper: {
        height: ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    wheelItem: {
        height: ITEM_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: scaleSize(8),
    },
    wheelText: {
        fontSize: scaleFont(18),
        color: "#666",
    },
    wheelTextActive: {
        color: "#390492",
        fontWeight: "600",
    },
    emoji: {
        fontSize: scaleFont(18),
    },
});

