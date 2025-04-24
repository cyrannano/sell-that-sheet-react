import React, { useEffect, useState } from "react";
import {
  Box,
  Textarea,
  Select,
  Button,
  Spinner,
  List,
  ListItem,
  Badge,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { api } from "contexts/AuthContext";

const TranslateBaselinkerProducts = () => {
  const [inputValue, setInputValue] = useState("");
  const [language, setLanguage] = useState("de");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [globalWarnings, setGlobalWarnings] = useState([]);

  useEffect(() => {
    setError("To jeszcze nie jest włączone.");
  }, []);

  // Parsuje tekst wejściowy na listę unikalnych ID (int)
  const parseIds = (text) => {
    const parts = text
      .split(/[,\n\s]+/) // rozdziel według przecinków, nowych linii lub spacji
      .map((s) => s.trim())
      .filter((s) => s !== "");
    const numbers = parts.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));
    return Array.from(new Set(numbers));
  };

  const handleTranslate = async () => {
    setError(null);
    setResults([]);
    setGlobalWarnings([]);

    const ids = parseIds(inputValue);
    if (ids.length === 0) {
      setError("Nie znaleziono poprawnych numerów ID.");
      return;
    }

    setLoading(true);
    try {
      const payload = { product_ids: ids, language };
      const response = await api.post("/api/translate-products/", payload);
      // Oczekujemy, że backend zwróci { results: [...], warnings: [...] }
      const data = response.data;
      setResults(data.results || []);
      setGlobalWarnings(data.warnings || []);
    } catch (err) {
      console.error("Błąd zapytania:", err);
      const msg =
        err.response?.data?.detail || "Wystąpił błąd podczas tłumaczenia.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} maxW="600px" mx="auto">
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Wprowadź identyfikatory produktów BaseLinker</FormLabel>
          <Textarea
            placeholder="np. 123, 456"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={4}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Wybierz język docelowy</FormLabel>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="de">Niemiecki</option>
            {/* <option value="fr">Francuski</option> */}
            {/* <option value="es">Hiszpański</option> */}
            {/* <option value="en">Angielski</option> */}
          </Select>
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleTranslate}
          isDisabled={loading}
        >
          Tłumacz
        </Button>

        {loading && <Spinner alignSelf="center" />}

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {globalWarnings.map((w, i) => (
          <Alert status="warning" key={i}>
            <AlertIcon />
            {w}
          </Alert>
        ))}

        {results.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>
              Wyniki:
            </Text>
            <List spacing={3}>
              {results.map((item) => (
                <ListItem
                  key={item.product_id}
                  p={2}
                  borderWidth={1}
                  borderRadius="md"
                >
                  <HStack justify="space-between">
                    <Text>ID: {item.product_id}</Text>
                    <Badge
                      colorScheme={item.status === "SUCCESS" ? "green" : "red"}
                    >
                      {item.status}
                    </Badge>
                  </HStack>
                  {item.warnings && item.warnings.length > 0 && (
                    <VStack mt={2} align="stretch">
                      {item.warnings.map((warn, idx) => (
                        <Alert status="warning" key={idx}>
                          <AlertIcon />
                          {warn}
                        </Alert>
                      ))}
                    </VStack>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TranslateBaselinkerProducts;
