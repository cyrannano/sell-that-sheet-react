import React, { useEffect, useState } from "react";
import { Box, Input, Button, VStack, Text, Select, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { fetchTranslationExamples, saveTranslationExamples, updateTranslationExample, deleteTranslationExample } from "contexts/AuthContext";

const TranslationManager = () => {
  const [translations, setTranslations] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState("pl");
  const [targetLanguage, setTargetLanguage] = useState("de");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      const data = await fetchTranslationExamples();
      setTranslations(data);
    } catch (error) {
      console.error("Nie udało się załadować tłumaczeń", error);
    }
  };

  const handleSave = async () => {
    if (!sourceText || !targetText) {
      alert("Tekst i jego tłumaczenie są wymagane!");
      return;
    }

    try {
      if (editingId) {
        await updateTranslationExample(editingId, {
          source_language: sourceLanguage,
          target_language: targetLanguage,
          source_text: sourceText,
          target_text: targetText,
        });
        setEditingId(null);
      } else {
        await saveTranslationExamples({
          source_language: sourceLanguage,
          target_language: targetLanguage,
          source_text: sourceText,
          target_text: targetText,
        });
      }
      setSourceText("");
      setTargetText("");
      loadTranslations();
    } catch (error) {
      console.error("Nie udało się zapisać tłumaczenia", error);
    }
  };

  const handleEdit = (translation) => {
    setEditingId(translation.id);
    setSourceLanguage(translation.source_language);
    setTargetLanguage(translation.target_language);
    setSourceText(translation.source_text);
    setTargetText(translation.target_text);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć to tłumaczenie?")) {
      try {
        await deleteTranslationExample(id);
        loadTranslations();
      } catch (error) {
        console.error("Nie udało się usunąć tłumaczenia", error);
      }
    }
  };

  return (
    <Box p={5} maxW="800px" mx="auto">
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="bold">
          Słownik Tłumaczeń
        </Text>

        <Select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
          <option value="pl">Polski</option>
          <option value="de">Niemiecki</option>
        </Select>

        <Select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
          <option value="pl">Polski</option>
          <option value="de">Niemiecki</option>
        </Select>

        <Input
          placeholder="Wprowadź tekst"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
        />
        <Input
          placeholder="Przetłumacz"
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleSave}>
          {editingId ? "Zaktualizuj tłumaczenie" : "Zapisz tłumaczenie"}
        </Button>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Język źródłowy</Th>
              <Th>Język docelowy</Th>
              <Th>Oryginalny tekst</Th>
              <Th>Tłumaczenie</Th>
              <Th>Akcje</Th>
            </Tr>
          </Thead>
          <Tbody>
            {translations.map((t) => (
              <Tr key={t.id}>
                <Td>{t.source_language}</Td>
                <Td>{t.target_language}</Td>
                <Td>{t.source_text}</Td>
                <Td>{t.target_text}</Td>
                <Td>
                  <Button size="sm" colorScheme="yellow" onClick={() => handleEdit(t)} mr={2}>
                    Edytuj
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={() => handleDelete(t.id)}>
                    Usuń
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default TranslationManager;
