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
  Checkbox,
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";

import { saveKeywordTranslation, getKeywordTranslations } from "contexts/AuthContext";

const KeywordTranslationModal = ({ isOpen, onClose, keywords: initialKeywords, category }) => {
  const [keywords, setKeywords] = useState([]);
  const [translations, setTranslations] = useState({});
  const [sharedStatus, setSharedStatus] = useState({});
  const [newKeyword, setNewKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state with props when modal is opened
  useEffect(() => {
    if (isOpen) {
      const lowercaseKeywords = initialKeywords.map((keyword) => keyword.toLowerCase());
      setKeywords(lowercaseKeywords);
      setTranslations({});
      setSharedStatus({});
      if (lowercaseKeywords.length > 0) {
        fetchTranslations(lowercaseKeywords);
      }
    }
  }, [isOpen, initialKeywords]);

  // Fetch existing translations from the API
  const fetchTranslations = async (keywords) => {
    setLoading(true);
    try {
      const existingTranslations = await getKeywordTranslations(keywords, "de", category);
      const translations = Object.fromEntries(
        Object.entries(existingTranslations).map(([key, value]) => [
          key.toLowerCase(),
          { translated: value.translated?.toLowerCase() || "", shared: value.shared || false },
        ])
      );
      setTranslations(
        Object.fromEntries(Object.entries(translations).map(([key, value]) => [key, value.translated]))
      );
      setSharedStatus(
        Object.fromEntries(Object.entries(translations).map(([key, value]) => [key, value.shared]))
      );
    } catch (error) {
      console.error("Failed to fetch translations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (keyword, value) => {
    setTranslations((prev) => ({ ...prev, [keyword]: value.toLowerCase() }));
  };

  const handleCheckboxChange = (keyword) => {
    setSharedStatus((prev) => ({ ...prev, [keyword]: !prev[keyword] }));
  };

  const handleAddKeyword = () => {
    const lowercaseKeyword = newKeyword.trim().toLowerCase();
    if (lowercaseKeyword && !keywords.includes(lowercaseKeyword)) {
      setKeywords((prev) => [...prev, lowercaseKeyword]);
      setTranslations((prev) => ({ ...prev, [lowercaseKeyword]: "" }));
      setSharedStatus((prev) => ({ ...prev, [lowercaseKeyword]: false }));
      setNewKeyword("");
    }
  };

  const handleSave = async () => {
    const result = keywords
      .filter((keyword) => translations[keyword] && translations[keyword].trim())
      .reduce((acc, keyword) => {
        acc[keyword] = { translated: translations[keyword], shared: sharedStatus[keyword] || false };
        return acc;
      }, {});

    try {
      await Promise.all(
        Object.keys(result).map((keyword) =>
          saveKeywordTranslation(
            keyword,
            result[keyword].translated,
            "de",
            category,
            result[keyword].shared
          )
        )
      );
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
        <ModalHeader>Tłumaczenie słówek</ModalHeader>
        <ModalBody>
          {loading ? (
            <Spinner size="xl" />
          ) : (
            <>
            <Grid templateColumns="2fr 2fr 1fr" gap={4} alignItems="center">
              <GridItem>
                {keywords.map((keyword) => (
                  <Input
                    key={`${keyword}-word`}
                    value={keyword}
                    isReadOnly
                    variant="filled"
                    placeholder="Słowo"
                    height="40px" // Ensure consistent height with checkbox
                  />
                ))}
              </GridItem>
              <GridItem>
                {keywords.map((keyword) => (
                  <Input
                    key={`${keyword}-translation`}
                    placeholder="Tłumaczenie"
                    value={translations[keyword] || ""}
                    onChange={(e) => handleInputChange(keyword, e.target.value)}
                    height="40px" // Ensure consistent height with checkbox
                  />
                ))}
              </GridItem>
              <GridItem>
                {keywords.map((keyword) => (
                  <Checkbox
                    key={`${keyword}-checkbox`}
                    isChecked={sharedStatus[keyword]}
                    onChange={() => handleCheckboxChange(keyword)}
                    display="flex"
                    alignItems="center"
                    height="40px" // Align with input field heights
                  >
                    Shared
                  </Checkbox>
                ))}
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
