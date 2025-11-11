import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, } from "react-native";
import { Camera, useCameraPermissions, CameraView } from "expo-camera";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";

let Html5Qrcode: any;
if (Platform.OS === "web") {
  Html5Qrcode = require("html5-qrcode").Html5Qrcode;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
}

const BarcodeScannerModal: React.FC<Props> = ({ visible, onClose, onScanned }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    // Solicita permissão quando o modal for aberto 
    if (visible) {
      if (Platform.OS === "web") {
        if (!divRef.current) return;
        const html5QrCode = new Html5Qrcode(divRef.current.id);

        html5QrCode.start(
          { facingMode: "environment" }, // câmera traseira
          {
            fps: 5, // menos frames ajuda na estabilidade
            qrbox: { width: 300, height: 200 }, // área de leitura maior
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.QR_CODE,
            ],
          },
          (decodedText: string) => {
            if (!scanned) {
              alert(decodedText)
              setScanned(true);
              onScanned(decodedText);
              html5QrCode.stop();
              onClose();
            }
          },
          (errorMessage: string) => {
            // erros de leitura (normal ficar logando bastante)
            console.log("Scanner Web:", errorMessage);
          }
        );

        return () => {
          html5QrCode.stop().catch(() => { });
        };
      }
      else {
        (async () => {
          try {
            setRequesting(true);
            const { status } = await Camera.requestCameraPermissionsAsync();
            if (!mounted) return;

            if (status === "granted") {
              // Espera um curto tempo para evitar inicialização prematura no iOS
              await new Promise((r) => setTimeout(r, 300));
            }

            setHasPermission(status === "granted");
            setScanned(false);
            scannedRef.current = false;
          } catch {
            setHasPermission(false);
          } finally {
            if (mounted) setRequesting(false);
          }
        })();
      }
    }
    return () => {
      mounted = false;
    };
  }, [visible]);

  function handleBarCodeScanned({ data }: { type: string; data: string }) {
    if (scannedRef.current) return;
    // evita múltiplas chamadas 
    scannedRef.current = true;
    setScanned(true);
    onScanned(data);
    // opcional: fecha o modal automaticamente 
    onClose();
    setTimeout(() => {
      scannedRef.current = false;
    }, 1000);
  }

  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.container}>
        {Platform.OS === "web" ? (
          <>
            <div id="reader" ref={divRef} style={{ width: 300, height: 300 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>❌ Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : requesting ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8 }}>Solicitando permissão...</Text>
          </View>
        ) : hasPermission === false ? (
          <View style={styles.center}>
            <Text>Permissão para câmera negada.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.flexFill}>
            <CameraView
              key={visible ? "camera-active" : "camera-inactive"}
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={
                { barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_e', 'upc_a'], }
              }
              onBarcodeScanned={handleBarCodeScanned}
              autofocus='on'
            />
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>❌ Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.hintText}> Aponte a câmera para o código de barras </Text>
            </View>
          </View>)}
      </View>
    </Modal>
  );
};

export default BarcodeScannerModal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  flexFill: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  footer: { position: "absolute", bottom: Platform.OS === "ios" ? 40 : 20, left: 0, right: 0, alignItems: "center", },
  cancelBtn: { backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginBottom: 10, },
  cancelText: { color: "#fff", fontSize: 16 }, hintText: { color: "#fff", textAlign: "center" },
  closeButton: { marginTop: 12, backgroundColor: "#2196F3", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, },
  closeButtonText: { color: "#fff" },
});