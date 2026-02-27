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

type RestaurantRow = {
  id: string | number;
  name: string;
  district?: string | null;
  description?: string | null;
  image_url?: string | null;
  phone?: string | null;
  [key: string]: any;
};

const bg21 = require("../assets/images/2-1.jpg");
const bg22 = require("../assets/images/2-2.jpg");
const bg23 = require("../assets/images/2-3.jpg");
const bg24 = require("../assets/images/2-4.jpg");
const bg25 = require("../assets/images/2-5.jpg");

const normalizeName = (name: string) => name.trim().toLowerCase();

const pickRestaurantBg = (name: string) => {
  const key = normalizeName(name);

  if (key.includes("comehome")) return bg25;
  if (key.includes("daisuki") || key.includes("daiki")) return bg24;
  if (key.includes("mata")) return bg23;
  if (key.includes("skyline")) return bg21;
  if (name.includes("ครัวลุงหนวด") || key.includes("ครัวลุงหนวด")) return bg22;

  return undefined;
};

export default function Restaurant() {
  const router = useRouter();
  const [items, setItems] = useState<RestaurantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from("recom_restaurant")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
      setItems([]);
      return;
    }

    setItems((data ?? []) as RestaurantRow[]);
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

  const renderItem = ({ item }: { item: RestaurantRow }) => {
    const localBg = pickRestaurantBg(item.name);

    return (
      <Pressable
        onPress={() => router.push((`/restaurant/${item.id}` as unknown) as any)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {localBg ? (
          <ImageBackground
            source={localBg}
            style={styles.cardBg}
            imageStyle={styles.cardBgImage}
          >
            <View style={styles.chevronWrap}>
              <Ionicons name="chevron-forward" size={24} color="#111111" />
            </View>
            <Text style={styles.nameOnImage} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.districtOnImage} numberOfLines={1}>
              📍 {item.district ?? ""}
            </Text>
          </ImageBackground>
        ) : (
          <View style={styles.cardBgPlain}>
            <View style={styles.chevronWrap}>
              <Ionicons name="chevron-forward" size={24} color="#111111" />
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.district} numberOfLines={1}>
              📍 {item.district ?? ""}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <AnimatedScreen title="ร้านอาหารแนะนำ">
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
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
  },
  district: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
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
