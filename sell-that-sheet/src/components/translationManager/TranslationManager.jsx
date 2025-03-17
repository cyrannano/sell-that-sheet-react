import React, { useEffect, useState } from "react";
import { Box, Textarea, Button, VStack, Text, Select, Table, Thead, Tbody, Tr, Th, Td, Input } from "@chakra-ui/react";
import { fetchTranslationExamples, saveTranslationExamples, updateTranslationExample, deleteTranslationExample } from "contexts/AuthContext";
import { MdEdit, MdOutlineDeleteForever } from "react-icons/md";


const TranslationManager = () => {
  const [translations, setTranslations] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState("pl");
  const [targetLanguage, setTargetLanguage] = useState("de");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
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
      alert("Tekst i tłumaczenie są wymagane!");
      return;
    }

    const translationData = {
      source_language: sourceLanguage,
      target_language: targetLanguage,
      source_text: sourceText,
      target_text: targetText,
      category_id: categoryId ? Number(categoryId) : null, // Allow null
      description: description || null, // Allow null
    };

    try {
      if (editingId) {
        await updateTranslationExample(editingId, translationData);
        setEditingId(null);
      } else {
        await saveTranslationExamples(translationData);
      }
      setSourceText("");
      setTargetText("");
      setCategoryId("");
      setDescription("");
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
    setCategoryId(translation.category_id || "");
    setDescription(translation.description || "");
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
    <Box p={5} maxW="1200px" w="1200px" mx="auto">
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
          type="number"
          placeholder="ID kategorii (opcjonalne)"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />

        <Textarea
          placeholder="Wprowadź tekst"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          size="lg"
        />
        <Textarea
          placeholder="Przetłumacz"
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
          size="lg"
        />
        <Textarea
          placeholder="Opis (opcjonalne) – co jest ważne w tym tłumaczeniu?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="lg"
        />
        <Button colorScheme="blue" onClick={handleSave}>
          {editingId ? "Zaktualizuj tłumaczenie" : "Zapisz tłumaczenie"}
        </Button>

        {/* Updated Table Layout */}
        <Table variant="simple" width="100%">
          <Thead>
            <Tr>
              <Th width="7.5%">Języki</Th>
              <Th width="7.5%">Kategoria</Th>
              <Th width="30%">Oryginalny tekst</Th>
              <Th width="30%">Tłumaczenie</Th>
              <Th width="23%">Opis</Th>
              <Th width="5%">Akcje</Th>
            </Tr>
          </Thead>
          <Tbody>
            {translations.map((t) => (
              <Tr key={t.id}>
                <Td>{t.source_language}<br/>↓<br/>{t.target_language}</Td>
                <Td>{t.category_id || "—"}</Td>
                <Td>{t.source_text}</Td>
                <Td>{t.target_text}</Td>
                <Td>{t.description || "—"}</Td>
                <Td>
                  <Button size="sm" colorScheme="blue" variant='ghost' onClick={() => handleEdit(t)} mr={2}>
                    <MdEdit size={'1.5em'}/>
                  </Button>
                  <Button size="sm" colorScheme="red" variant='ghost' onClick={() => handleDelete(t.id)}>
                    <MdOutlineDeleteForever size={'1.5em'}/>
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
