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

type EventRow = {
  id: string | number;
  name: string;
  district?: string | null;
  description?: string | null;
  image_url?: string | null;
  event_time?: string | null;
  [key: string]: any;
};

const bg51 = require("../assets/images/5-1.jpg");
const bg52 = require("../assets/images/5-2.jpg");
const bg53 = require("../assets/images/5-3.jpg");

const normalizeName = (name: string) => name.trim().toLowerCase();

const compactKey = (name: string) =>
  normalizeName(name)
    .replace(/^'+|'+$/g, "")
    .replace(/[^a-z0-9ก-๙]+/gi, "");

const pickEventBg = (name: string) => {
  const key = compactKey(name);

  if (key.includes("งานประเพณีเจ้าพ่อพระยาแล") || key.includes("เจ้าพ่อพระยาแล")) return bg51;
  if (key.includes("เทศกาลทุ่ง") && key.includes("ดอกกระเจียว") && key.includes("บาน")) return bg53;
  if (key.includes("ประเพณีแห่") && key.includes("ผีสุ่ม")) return bg52;

  return undefined;
};

export default function Event() {
  const router = useRouter();
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from("recom_event")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
      setItems([]);
      return;
    }

    setItems((data ?? []) as EventRow[]);
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

  const renderItem = ({ item }: { item: EventRow }) => {
    const localBg = pickEventBg(item.name);

    return (
      <Pressable
        onPress={() => router.push((`/event/${item.id}` as unknown) as any)}
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
            <Text style={styles.nameOnImage} numberOfLines={2}>
              {item.name}
            </Text>
            {item.event_time ? (
              <Text style={styles.metaOnImage} numberOfLines={1}>
                ⏰ {item.event_time}
              </Text>
            ) : null}
          </ImageBackground>
        ) : (
          <View style={styles.cardBgPlain}>
            <View style={styles.chevronWrap}>
              <Ionicons name="chevron-forward" size={24} color="#111111" />
            </View>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            {item.event_time ? (
              <Text style={styles.meta} numberOfLines={1}>
                ⏰ {item.event_time}
              </Text>
            ) : null}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <AnimatedScreen title="ประเพณี">
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
  meta: {
    marginTop: 4,
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
  metaOnImage: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
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
