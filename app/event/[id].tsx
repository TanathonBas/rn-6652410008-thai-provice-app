import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import AnimatedScreen from "../../components/AnimatedScreen";
import { supabase } from "../../services/supabase";

type EventRow = {
  id: string | number;
  name: string;
  district?: string | null;
  description?: string | null;
  image_url?: string | null;
  event_time?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  longtitude?: number | null;
  [key: string]: any;
};

export default function EventDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const id = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.id]);

  const [item, setItem] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const latLon = useMemo(() => {
    const anyItem = item as any;
    const lat = anyItem?.latitude ?? anyItem?.lat;
    const lon = anyItem?.longitude ?? anyItem?.longtitude ?? anyItem?.lng ?? anyItem?.lon;

    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;

    return { lat: latNum, lon: lonNum };
  }, [item]);

  const coordsText = useMemo(() => {
    if (!latLon) return "-";
    return `${latLon.lat}, ${latLon.lon}`;
  }, [latLon]);

  const openGoogleMaps = useMemo(() => {
    if (!latLon) return null;
    const label = (item as any)?.name ? String((item as any).name) : "Location";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${latLon.lat},${latLon.lon}(${label})`
    )}`;
    return async () => {
      await Linking.openURL(url);
    };
  }, [item, latLon]);

  const tileUrl = useMemo(() => {
    if (!latLon) return null;

    const z = 15;
    const n = 2 ** z;
    const latRad = (latLon.lat * Math.PI) / 180;
    const x = Math.floor(((latLon.lon + 180) / 360) * n);
    const y = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    );

    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }, [latLon]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError("Missing id");
          setItem(null);
          return;
        }

        const { data, error } = await supabase
          .from("recom_event")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          setError(error.message);
          setItem(null);
          return;
        }

        if (!cancelled) setItem((data ?? null) as EventRow | null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AnimatedScreen title={item?.name ?? "รายละเอียดประเพณี"} backTarget="/event">
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !item ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>ไม่พบข้อมูล</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroImagePlaceholder} />
          )}

          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            {item.event_time ? <Text style={styles.meta}>⏰ {item.event_time}</Text> : null}

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>รายละเอียด</Text>
            <Text style={styles.description}>{item.description ?? ""}</Text>

            <View style={styles.divider} />
          </View>
        </ScrollView>
      )}
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
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
  content: {
    paddingBottom: 24,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 18,
    backgroundColor: "#F1F1F1",
  },
  heroImagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 18,
    backgroundColor: "#F1F1F1",
  },
  card: {
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#111111",
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
  },
  meta: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#444444",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    lineHeight: 20,
  },
  coords: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
  },
  mapPressable: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  mapPreview: {
    width: "100%",
    height: 180,
    backgroundColor: "#F1F1F1",
    alignItems: "center",
    justifyContent: "center",
  },
  mapPreviewImage: {
    resizeMode: "cover",
  },
  pinWrap: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    fontSize: 34,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mapPlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#F6F6F6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  mapPlaceholderTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111111",
  },
  mapPlaceholderSubtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#444444",
    textAlign: "center",
  },
});
