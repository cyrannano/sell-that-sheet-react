import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Grid,
  GridItem,
  VStack,
  HStack,
  Spinner,
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";

import { saveKeywordTranslation, getKeywordTranslationsDe } from "contexts/AuthContext";

const KeywordTranslationModal = ({ isOpen, onClose, keywords: initialKeywords, category }) => {
  const [keywords, setKeywords] = useState([]);
  const [translations, setTranslations] = useState({});
  const [newKeyword, setNewKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state with props when modal is opened
  useEffect(() => {
    if (isOpen) {
      setKeywords(initialKeywords);
      setTranslations({});
      if (initialKeywords.length > 0) {
        fetchTranslations(initialKeywords);
      }
    }
  }, [isOpen, initialKeywords]);

  // Fetch existing translations from the API
  const fetchTranslations = async (keywords) => {
    setLoading(true);
    try {
      const existingTranslations = await getKeywordTranslationsDe(keywords, "de", category);
      setTranslations(existingTranslations); // API provides { keyword: translation } object
    } catch (error) {
      console.error("Failed to fetch translations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (keyword, value) => {
    setTranslations((prev) => ({ ...prev, [keyword]: value }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword)) {
      setKeywords((prev) => [...prev, newKeyword]);
      setTranslations((prev) => ({ ...prev, [newKeyword]: "" })); // Add empty translation for new keyword
      setNewKeyword("");
    }
  };

  const handleSave = async () => {
    const result = keywords
      .filter(
        (keyword) =>
          translations[keyword] !== undefined &&
          translations[keyword] !== "" &&
          translations[keyword] !== null
      )
      .reduce((acc, keyword) => {
        acc[keyword] = translations[keyword] || "";
        return acc;
      }, {});

    // Save each keyword translation
    try {
      for (const keyword in result) {
        await saveKeywordTranslation(keyword, result[keyword], "de", category);
      }
    } catch (error) {
      console.error("Failed to save translations:", error);
    } finally {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Keyword Translation</ModalHeader>
        <ModalBody>
          {loading ? (
            <Spinner size="xl" />
          ) : (
            <>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <VStack align="stretch">
                    {keywords.map((keyword) => (
                      <Input
                        key={keyword}
                        value={keyword}
                        isReadOnly
                        variant="filled"
                        placeholder="Słowo"
                      />
                    ))}
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="stretch">
                    {keywords.map((keyword) => (
                      <Input
                        key={keyword}
                        placeholder="Tłumaczenie"
                        value={translations[keyword] || ""}
                        onChange={(e) => handleInputChange(keyword, e.target.value)}
                      />
                    ))}
                  </VStack>
                </GridItem>
              </Grid>
              <HStack mt={4}>
                <Input
                  placeholder="Dodaj nowe słowo"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                />
                <Button onClick={handleAddKeyword} colorScheme="green">
                  <AddIcon />
                </Button>
              </HStack>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSave} mr={3} isDisabled={loading}>
            Zapisz
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default KeywordTranslationModal;
