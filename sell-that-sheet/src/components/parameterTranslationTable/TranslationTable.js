import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Text,
  VStack,
  Collapse,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { toast } from 'react-toastify';
import { 
  getAllParameters, 
  getAllAuctionParameters,
  fetchTranslations,
  saveTranslations
} from "contexts/AuthContext";

const TranslationTable = () => {
  const [parameters, setParameters] = useState([]);
  const [auctionParameters, setAuctionParameters] = useState([]);
  const [translations, setTranslations] = useState({});
  const [expanded, setExpanded] = useState({});
  const [showUntranslatedOnly, setShowUntranslatedOnly] = useState(false);

  useEffect(() => {
    // Load parameters, auction params, and existing translations
    const fetchData = async () => {
      try {
        const [params, auctionParams] = await Promise.all([
          getAllParameters(),
          getAllAuctionParameters(),
        ]);

        // Load existing translations
        const loadedTranslations = await fetchTranslations();

        setParameters(params);
        setAuctionParameters(auctionParams);
        setTranslations(loadedTranslations); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Expand/collapse a parameter row
  const handleExpand = (paramId) => {
    setExpanded((prev) => ({ ...prev, [paramId]: !prev[paramId] }));
  };

  // Update the translations in local state
  const handleTranslationChange = (key, value) => {
    setTranslations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Check if a param is fully translated
  const isParamFullyTranslated = (paramId) => {
    const paramKey = `param-${paramId}`;
    if (!translations[paramKey] || !translations[paramKey].trim()) {
      return false;
    }
    const values = auctionParameters.filter((ap) => ap.parameter === paramId);
    for (let val of values) {
      const subKey = `param-${paramId}-value-${val.value_name}`;
      if (!translations[subKey] || !translations[subKey].trim()) {
        return false;
      }
    }
    return true;
  };

  // Show only untranslated or all
  const toggleShowUntranslatedOnly = () => {
    setShowUntranslatedOnly((prev) => {
      const newVal = !prev;
      if (newVal) {
        // expand all
        const expandedAll = {};
        parameters.forEach((p) => {
          expandedAll[p.id] = true;
        });
        setExpanded(expandedAll);
      } else {
        // collapse all
        setExpanded({});
      }
      return newVal;
    });
  };

  // Save updated translations to the API
  const handleSaveTranslations = async () => {
    saveTranslations(translations).then(() => {
      toast.success("Tłumaczenia zostały zapisane!");
    }).catch((error) => {
      console.error("Error saving translations:", error);
      toast.error("Wystąpił błąd podczas zapisywania tłumaczeń. Spróbuj ponownie.");
    });
  };

  // Render sub-values for a given parameter
  const renderParameterValues = (paramId) => {
    const values = auctionParameters.filter((ap) => ap.parameter === paramId);

    return (
      <VStack spacing={2} align="start" mt={2}>
        {values.map((val) => {
          const uniqueKey = `param-${paramId}-value-${val.value_name}`;
          const isEmpty = !translations[uniqueKey] || !translations[uniqueKey].trim();

          return (
            <Box key={uniqueKey} w="100%">
              <Text fontSize="sm" mb={1}>
                {val.value_name}
              </Text>
              <Input
                size="sm"
                // Highlight if showUntranslatedOnly is active AND this field is empty
                bg={
                  showUntranslatedOnly && isEmpty
                    ? "yellow.100"
                    : "white"
                }
                value={translations[uniqueKey] || ""}
                onChange={(e) => handleTranslationChange(uniqueKey, e.target.value)}
                placeholder={`Tłumaczenie "${val.value_name}"`}
              />
            </Box>
          );
        })}
      </VStack>
    );
  };

  return (
    <Box p={6} maxW="800px" mx="auto">
      {/* Header + Control Buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Tłumaczenie parametrów
        </Text>
        <Box>
          <Button colorScheme="blue" mr={2} onClick={toggleShowUntranslatedOnly}>
            {showUntranslatedOnly ? "Pokaż wszystkie" : "Pokaż nieprzetłumaczone"}
          </Button>
          <Button colorScheme="green" onClick={handleSaveTranslations}>
            Zapisz tłumaczenia
          </Button>
        </Box>
      </Box>

      <Table variant="striped" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>Oryginał</Th>
            <Th>Tłumaczenie</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {parameters.map((param) => {
            // Skip fully translated if user wants only untranslated
            if (showUntranslatedOnly && isParamFullyTranslated(param.id)) {
              return null;
            }

            const key = `param-${param.id}`;
            const paramIsEmpty = !translations[key] || !translations[key].trim();

            return (
              <React.Fragment key={key}>
                <Tr>
                  <Td fontWeight="bold">
                    <Box display="flex" alignItems="center">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={
                          expanded[param.id] ? (
                            <ChevronDownIcon />
                          ) : (
                            <ChevronRightIcon />
                          )
                        }
                        onClick={() => handleExpand(param.id)}
                        aria-label="Pokaż/Ukryj wartości"
                      />
                      <Text ml={2}>{param.name}</Text>
                    </Box>
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      // Highlight param input as well if empty
                      bg={
                        showUntranslatedOnly && paramIsEmpty
                          ? "yellow.100"
                          : "white"
                      }
                      value={translations[key] || ""}
                      onChange={(e) => handleTranslationChange(key, e.target.value)}
                      placeholder={`Tłumaczenie "${param.name}"`}
                    />
                  </Td>
                  <Td />
                </Tr>
                <Tr>
                  <Td colSpan="3" p={0}>
                    <Collapse in={expanded[param.id]}>
                      {renderParameterValues(param.id)}
                    </Collapse>
                  </Td>
                </Tr>
              </React.Fragment>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TranslationTable;
