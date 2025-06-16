import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Button,
  Input,
  Text,
  HStack,
  useToast,
} from "@chakra-ui/react";
import {
  convertRowsToColumns,
  startAllegroExport,
  downloadAllegroExport,
  startAuctionExport,
  downloadAuctionExport,
} from "contexts/AuthContext";

const DataExporter = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [allegroRunning, setAllegroRunning] = useState(false);
  const [auctionRunning, setAuctionRunning] = useState(false);
  const toast = useToast();

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleConvert = async () => {
    if (!csvFile) return;
    try {
      const blob = await convertRowsToColumns(csvFile);
      downloadBlob(blob, "converted.csv");
      toast({
        title: "Plik zapisany",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Błąd konwersji",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const pollAllegro = async () => {
    const blob = await downloadAllegroExport();
    if (blob) {
      downloadBlob(blob, "full_catalogue.xlsx");
      setAllegroRunning(false);
      toast({
        title: "Pobrano katalog",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      setTimeout(pollAllegro, 5000);
    }
  };

  const handleAllegroExport = async () => {
    try {
      setAllegroRunning(true);
      await startAllegroExport();
      pollAllegro();
    } catch (err) {
      setAllegroRunning(false);
      toast({
        title: "Błąd eksportu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const pollAuction = async () => {
    const blob = await downloadAuctionExport();
    if (blob) {
      downloadBlob(blob, "auctions_export.xlsx");
      setAuctionRunning(false);
      toast({
        title: "Pobrano aukcje",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      setTimeout(pollAuction, 5000);
    }
  };

  const handleAuctionExport = async () => {
    try {
      setAuctionRunning(true);
      await startAuctionExport();
      pollAuction();
    } catch (err) {
      setAuctionRunning(false);
      toast({
        title: "Błąd eksportu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} maxW="600px" mx="auto">
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Eksporter danych</Heading>

        <Box>
          <Heading size="md" mb={2}>
            Konwertuj CSV na XLSX
          </Heading>
          <HStack>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
            />
            <Button
              colorScheme="blue"
              onClick={handleConvert}
              isDisabled={!csvFile}
            >
              Konwertuj
            </Button>
          </HStack>
        </Box>

        <Box>
          <Heading size="md" mb={2}>
            Eksportuj produkty Allegro
          </Heading>
          <Button
            colorScheme="blue"
            onClick={handleAllegroExport}
            isLoading={allegroRunning}
          >
            Rozpocznij eksport
          </Button>
          {allegroRunning && <Text mt={2}>Trwa generowanie pliku...</Text>}
        </Box>

        <Box>
          <Heading size="md" mb={2}>
            Eksportuj produkty z programu
          </Heading>
          <Button
            colorScheme="blue"
            onClick={handleAuctionExport}
            isLoading={auctionRunning}
          >
            Rozpocznij eksport
          </Button>
          {auctionRunning && <Text mt={2}>Trwa generowanie pliku...</Text>}
        </Box>
      </VStack>
    </Box>
  );
};

export default DataExporter;
