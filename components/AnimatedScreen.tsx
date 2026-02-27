import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Animated, BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BG_COLORS = ["#FFE4B5", "#FFDAB9", "#FFECB3", "#FFF5CC"];

type Props = {
  title: string;
  children: ReactNode;
  showBack?: boolean;
  contentStyle?: any;
  backTarget?: string;
};

export default function AnimatedScreen({ title, children, showBack = true, contentStyle, backTarget = "/home" }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bgIndex, setBgIndex] = useState(0);
  const colorAnim = useRef(new Animated.Value(0)).current;

  const goHome = useMemo(() => {
    return () => {
      router.push((backTarget as unknown) as any);
    };
  }, [router, backTarget]);

  useEffect(() => {
    let isMounted = true;

    const startAnimation = (fromIndex: number) => {
      const toIndex = (fromIndex + 1) % BG_COLORS.length;
      colorAnim.setValue(0);

      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        if (!isMounted) return;
        setBgIndex(toIndex);
        startAnimation(toIndex);
      });
    };

    startAnimation(0);

    return () => {
      isMounted = false;
      colorAnim.stopAnimation();
    };
  }, [colorAnim]);

  useEffect(() => {
    if (!showBack) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      goHome();
      return true;
    });

    return () => sub.remove();
  }, [goHome, showBack]);

  const backgroundColor = useMemo(() => {
    const nextIndex = (bgIndex + 1) % BG_COLORS.length;
    return colorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [BG_COLORS[bgIndex], BG_COLORS[nextIndex]],
    });
  }, [bgIndex, colorAnim]);

  return (
    <Animated.View style={[styles.container, { backgroundColor, paddingTop: 16 + insets.top }]}>
      <View style={styles.topBar}>
        {showBack ? (
          <Pressable onPress={goHome} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#111111" />
            <Text style={styles.backText}>กลับ</Text>
          </Pressable>
        ) : (
          <View style={styles.backButtonSpacer} />
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.backButtonSpacer} />
      </View>

      <View style={[styles.content, contentStyle]}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#111111",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  backButtonSpacer: {
    width: 56,
  },
  backText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
  },
  title: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
    fontSize: 20,
    fontWeight: "900",
    color: "#111111",
  },
  content: {
    flex: 1,
  },
});
