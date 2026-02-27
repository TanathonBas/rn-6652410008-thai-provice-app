import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AnimatedScreen from "../../components/AnimatedScreen";
import { supabase } from "../../services/supabase";

type CafeRow = {
  id: string | number;
  name: string;
  district?: string | null;
  description?: string | null;
  image_url?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  longtitude?: number | null;
  [key: string]: any;
};

const sanitizePhone = (phone: string) => phone.replace(/[^0-9+]/g, "");

export default function CafeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const id = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.id]);

  const [item, setItem] = useState<CafeRow | null>(null);
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
          .from("recom_cafe")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          setError(error.message);
          setItem(null);
          return;
        }

        if (!cancelled) setItem((data ?? null) as CafeRow | null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AnimatedScreen title={item?.name ?? "รายละเอียดร้านกาแฟ"} backTarget="/cafe">
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
            <Text style={styles.district}>📍 {item.district ?? ""}</Text>
            {item.phone ? (
              <Pressable
                onPress={() => {
                  const tel = sanitizePhone(String(item.phone));
                  if (tel) Linking.openURL(`tel:${tel}`);
                }}
                style={styles.phonePressable}
              >
                <Text style={styles.phone} numberOfLines={1}>
                  ☎ {item.phone}
                </Text>
              </Pressable>
            ) : null}

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>รายละเอียด</Text>
            <Text style={styles.description}>{item.description ?? ""}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>พิกัด</Text>
            {openGoogleMaps ? (
              <Pressable onPress={openGoogleMaps} style={styles.mapPressable}>
                {tileUrl ? (
                  <ImageBackground
                    source={{ uri: tileUrl }}
                    style={styles.mapPreview}
                    imageStyle={styles.mapPreviewImage}
                  >
                    <View style={styles.pinWrap}>
                      <Text style={styles.pin}>📍</Text>
                    </View>
                  </ImageBackground>
                ) : (
                  <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderTitle}>เปิดดูแผนที่</Text>
                    <Text style={styles.mapPlaceholderSubtitle}>แตะเพื่อเปิด Google Maps</Text>
                  </View>
                )}
              </Pressable>
            ) : (
              <Text style={styles.coords}>ไม่มีข้อมูลพิกัด</Text>
            )}
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
  district: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#444444",
  },
  meta: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#444444",
  },
  phonePressable: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 2,
  },
  phone: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0B57D0",
    textDecorationLine: "underline",
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
