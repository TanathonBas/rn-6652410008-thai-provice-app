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

type TempleRow = {
  id: string | number;
  name: string;
  district?: string | null;
  description?: string | null;
  image_url?: string | null;
  [key: string]: any;
};

const bg41 = require("../assets/images/4-1.jpg");
const bg42 = require("../assets/images/4-2.jpg");
const bg43 = require("../assets/images/4-3.jpg");
const bg44 = require("../assets/images/4-4.jpg");
const bg45 = require("../assets/images/4-5.jpg");

const normalizeName = (name: string) => name.trim().toLowerCase();

const compactKey = (name: string) =>
  normalizeName(name)
    .replace(/^'+|'+$/g, "")
    .replace(/[^a-z0-9ก-๙]+/gi, "");

const pickTempleBg = (name: string) => {
  const key = compactKey(name);

  if (key.includes("วัดชัยภูมิวนาราม")) return bg42;
  if (key.includes("วัดทรงศิลา")) return bg44;
  if (key.includes("วัดพระธาตุชัยภูมิ")) return bg41;
  if (key.includes("วัดพระธาตุหนองสามหมื่น")) return bg45;
  if (key.includes("วัดไพรีพินาศ")) return bg43;

  return undefined;
};

export default function Temple() {
  const router = useRouter();
  const [items, setItems] = useState<TempleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from("recom_temple")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
      setItems([]);
      return;
    }

    setItems((data ?? []) as TempleRow[]);
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

  const renderItem = ({ item }: { item: TempleRow }) => {
    const localBg = pickTempleBg(item.name);

    return (
      <Pressable
        onPress={() => router.push((`/temple/${item.id}` as unknown) as any)}
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
    <AnimatedScreen title="วัดแนะนำ">
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
