import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const logo = require("../assets/images/logo.png");
const touristImage = require("../assets/images/tourist.jpg");
const restaurantImage = require("../assets/images/restaurant.jpg");
const cafeImage = require("../assets/images/cafe.jpg");
const templeImage = require("../assets/images/temple.jpg");
const eventImage = require("../assets/images/event.jpg");
const BG_COLORS = ["#FFE4B5", "#FFDAB9", "#FFECB3", "#FFF5CC"];

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const colorAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const basePadding = typeof styles.container.padding === "number" ? styles.container.padding : 50;

  const handleNavigate = (path: string) => {
    router.push(path as any);
  };

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

  const nextIndex = (bgIndex + 1) % BG_COLORS.length;
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BG_COLORS[bgIndex], BG_COLORS[nextIndex]],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, paddingTop: basePadding + insets.top },
      ]}
    >
      {/* โลโก้ใหญ่ด้านบน */}
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>เที่ยวไทยชัยภูมิ</Text>
      </View>

      {/* แถวปุ่มที่ 1 */}
      <View style={styles.row}>
        <Pressable
          style={[styles.button, hovered === "btn1" && styles.buttonHover]}
          onPress={() => handleNavigate("/tourist")}
          onHoverIn={() => setHovered("btn1")}
          onHoverOut={() => setHovered(null)}
        >
          <ImageBackground
            source={touristImage}
            style={styles.buttonBg}
            imageStyle={styles.buttonBgImage}
          >
            <Text style={styles.buttonTextOnImage}>สถานที่ท่องเที่ยวแนะนำ</Text>
          </ImageBackground>
        </Pressable>
        <Pressable
          style={[styles.button, hovered === "btn2" && styles.buttonHover]}
          onPress={() => handleNavigate("/restaurant")}
          onHoverIn={() => setHovered("btn2")}
          onHoverOut={() => setHovered(null)}
        >
          <ImageBackground
            source={restaurantImage}
            style={styles.buttonBg}
            imageStyle={styles.buttonBgImage}
          >
            <Text style={styles.buttonTextOnImage}>ร้านอาหารแนะนำ</Text>
          </ImageBackground>
        </Pressable>
      </View>

      {/* แถวปุ่มที่ 2 */}
      <View style={styles.row}>
        <Pressable
          style={[styles.button, hovered === "btn3" && styles.buttonHover]}
          onPress={() => handleNavigate("/cafe")}
          onHoverIn={() => setHovered("btn3")}
          onHoverOut={() => setHovered(null)}
        >
          <ImageBackground
            source={cafeImage}
            style={styles.buttonBg}
            imageStyle={styles.buttonBgImage}
          >
            <Text style={styles.buttonTextOnImage}>ร้านกาแฟแนะนำ</Text>
          </ImageBackground>
        </Pressable>
        <Pressable
          style={[styles.button, hovered === "btn4" && styles.buttonHover]}
          onPress={() => handleNavigate("/temple")}
          onHoverIn={() => setHovered("btn4")}
          onHoverOut={() => setHovered(null)}
        >
          <ImageBackground
            source={templeImage}
            style={styles.buttonBg}
            imageStyle={styles.buttonBgImage}
          >
            <Text style={styles.buttonTextOnImage}>วัดแนะนำ</Text>
          </ImageBackground>
        </Pressable>
      </View>

      {/* ปุ่มเดี่ยวด้านล่าง */}
      <Pressable
        style={[
          styles.button,
          styles.singleButton,
          hovered === "single" && styles.buttonHover,
        ]}
        onPress={() => handleNavigate("/event")}
        onHoverIn={() => setHovered("single")}
        onHoverOut={() => setHovered(null)}
      >
        <ImageBackground
          source={eventImage}
          style={styles.buttonBg}
          imageStyle={styles.buttonBgImage}
        >
          <Text style={styles.buttonTextOnImage}>ประเพณี</Text>
        </ImageBackground>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  logoContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 56,
  },
  logo: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
  title: {
    marginTop: 8,
    fontSize: 40,
    fontWeight: "bold",
    color: "#333333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    width: "48%",
    height: 60,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  buttonBg: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    
  },
  buttonBgImage: {
    borderRadius: 0,
    opacity: 0.6,
    resizeMode: "cover",
  },
  buttonHover: {
    transform: [{ scale: 1.15 }],
  },
  singleButton: {
    alignSelf: "center",
    width: "48%",
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonTextOnImage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
