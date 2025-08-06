"use client";
import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  FormControl,
  FormLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import imageCompression from "browser-image-compression";

export default function ImageUploaderCropper({
  label,
  aspect = 1,
  maxWidth = 300,
  maxHeight = 300,
  maxSizeMB = 1,
  shape = "rect", // or "circle"
  onCropComplete,
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Max file size is ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      onOpen();
    };
    reader.readAsDataURL(file);
  };

  const onCrop = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropDone = async () => {
    const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const compressedBlob = await imageCompression(croppedImageBlob, {
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      maxSizeMB: maxSizeMB,
      useWebWorker: true,
    });

    const preview = URL.createObjectURL(compressedBlob);
    setPreviewUrl(preview);
    onCropComplete(compressedBlob);
    onClose();
  };

  return (
    <FormControl isRequired>
      <FormLabel>{label}</FormLabel>
      <Input type="file" accept="image/*" onChange={handleFileChange} />

      {previewUrl && (
        <Box mt={3}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: "180px",
              height: "auto",
              objectFit: "cover",
              borderRadius: shape === "circle" ? "50%" : "12px",
              border: "1px solid #ccc",
            }}
          />
        </Box>
      )}

      {/* Cropper Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crop {label}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box position="relative" width="100%" height="400px" bg="gray.800">
              <Cropper
                image={imageSrc}
                crop={{ x: 0, y: 0 }}
                zoom={zoom}
                aspect={aspect}
                onCropChange={() => {}}
                onCropComplete={onCrop}
                onZoomChange={setZoom}
                cropShape={shape === "circle" ? "round" : "rect"}
                showGrid={false}
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCropDone} colorScheme="blue">
              Done
            </Button>
            <Button onClick={onClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </FormControl>
  );
}
