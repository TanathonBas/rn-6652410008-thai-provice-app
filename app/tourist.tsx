import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AnimatedScreen from "../components/AnimatedScreen";
import { supabase } from "../services/supabase";

type TouristRow = {
  id: string | number;
  name: string;
  district?: string | null;
  description?: string | null;
  image_url?: string | null;
  [key: string]: any;
};

const bg3 = require("../assets/images/3.jpg");

export default function Tourist() {
  const router = useRouter();
  const [items, setItems] = useState<TouristRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from("recom_tourist")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
      setItems([]);
      return;
    }

    setItems((data ?? []) as TouristRow[]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await fetchItems();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchItems();
    } finally {
      setRefreshing(false);
    }
  }, [fetchItems]);

  const renderItem = ({ item }: { item: TouristRow }) => {
    const localBg = item.name === "ทุ่งบัวแดง" ? bg3 : undefined;
    const uriBg = !localBg && item.image_url ? { uri: item.image_url } : undefined;
    const source = localBg ?? uriBg;

    return (
      <Pressable
        onPress={() => router.push((`/tourist/${item.id}` as unknown) as any)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {source ? (
          <ImageBackground
            source={source as any}
            style={styles.cardBg}
            imageStyle={styles.cardBgImage}
          >
            <View style={styles.chevronWrap}>
              <Ionicons name="chevron-forward" size={24} color="#111111" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.nameOnImage} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.districtOnImage} numberOfLines={1}>
                📍 {item.district ?? ""}
              </Text>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.cardBgPlain}>
            <View style={styles.chevronWrap}>
              <Ionicons name="chevron-forward" size={24} color="#111111" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.district} numberOfLines={1}>
                📍 {item.district ?? ""}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <AnimatedScreen title="สถานที่ท่องเที่ยวแนะนำ">
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderWidth: 2,
    borderColor: "#111111",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardBg: {
    width: "100%",
    minHeight: 88,
    justifyContent: "flex-end",
    paddingVertical: 18,
    paddingHorizontal: 18,
    paddingRight: 46,
  },
  cardBgPlain: {
    width: "100%",
    minHeight: 88,
    justifyContent: "flex-end",
    paddingVertical: 18,
    paddingHorizontal: 18,
    paddingRight: 46,
    backgroundColor: "#FFFFFF",
  },
  chevronWrap: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  cardBgImage: {
    opacity: 0.4,
    resizeMode: "cover",
  },
  cardText: {
    width: "100%",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },
  district: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
    color: "#444444",
  },
  nameOnImage: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
    textShadowColor: "rgba(255,255,255,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  districtOnImage: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    textShadowColor: "rgba(255,255,255,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  errorText: {
    color: "#B00020",
    fontWeight: "600",
    textAlign: "center",
  },
});
