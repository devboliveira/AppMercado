import React, { useEffect, useRef } from "react";
import { Platform, View, Text } from "react-native";

// Só importa se for web
let Html5Qrcode: any;
if (Platform.OS === "web") {
  Html5Qrcode = require("html5-qrcode").Html5Qrcode;
}

type Props = {
  onScanned: (data: string) => void;
};

export default function BarcodeScannerWrapper({ onScanned }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (!divRef.current) return;

      const html5QrCode = new Html5Qrcode(divRef.current.id);
      html5QrCode.start(
        { facingMode: "environment" }, // câmera traseira
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          onScanned(decodedText);
          html5QrCode.stop(); // para após encontrar
        }
      );

      return () => {
        html5QrCode.stop().catch(() => {});
      };
    }
  }, []);

  if (Platform.OS === "web") {
    return (
      <div
        id="reader"
        ref={divRef}
        style={{ width: 300, height: 300 }}
      />
    );
  }

  // Mobile nativo (expo-barcode-scanner)
  const { BarCodeScanner } = require("expo-barcode-scanner");

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={({ data }: any) => onScanned(data)}
        style={{ flex: 1 }}
      />
    </View>
  );
}
