import { useEffect } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { useRouter } from "expo-router";

const logo = require("../assets/images/logo.png");

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace("/home");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFE4B5",
      }}
    >
      <Image
        source={logo}
        style={{
          width: 200,
          height: 200,
          resizeMode: "contain",
          marginBottom: 16,
        }}
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#333333",
          marginBottom: 24,
        }}
      >
        เที่ยวไทย จ.ชัยภูมิ
      </Text>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
