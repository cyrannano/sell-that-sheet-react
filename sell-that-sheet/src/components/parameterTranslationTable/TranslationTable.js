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
import { toast } from "react-toastify";
import {
  getAllParameters,
  getAllAuctionParameters,
  fetchTranslations,
  saveTranslations,
} from "contexts/AuthContext";

const TranslationTable = () => {
  const [parameters, setParameters] = useState([]);
  const [auctionParameters, setAuctionParameters] = useState([]);
  const [translations, setTranslations] = useState({});
  const [expanded, setExpanded] = useState({});
  const [showUntranslatedOnly, setShowUntranslatedOnly] = useState(false);
  const [paramTranslations, setParamTranslations] = useState({});
  const [auctionParamTranslations, setAuctionParamTranslations] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [params, auctionParams] = await Promise.all([
          getAllParameters(),
          getAllAuctionParameters(),
        ]);
        const loadedTranslations = await fetchTranslations();
        // loadedTranslations looks like the JSON shown above

        // Build paramTranslations
        const paramMap = {};
        loadedTranslations.param_translations.forEach((item) => {
          paramMap[item.param_id] = item.translation;
        });
        setParamTranslations(paramMap);

        // Build auctionParamTranslations
        const auctionMap = {};
        loadedTranslations.auction_param_translations.forEach((item) => {
          if (!auctionMap[item.param_id]) {
            auctionMap[item.param_id] = {};
          }
          auctionMap[item.param_id][item.value_name] = item.translation;
        });
        setAuctionParamTranslations(auctionMap);

        setParameters(params);
        setAuctionParameters(auctionParams);
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

  const handleParamTranslationChange = (paramId, newValue) => {
    setParamTranslations((prev) => ({
      ...prev,
      [paramId]: newValue,
    }));
  };

  const handleAuctionParamTranslationChange = (
    paramId,
    valueName,
    newValue
  ) => {
    setAuctionParamTranslations((prev) => ({
      ...prev,
      [paramId]: {
        ...(prev[paramId] || {}),
        [valueName]: newValue,
      },
    }));
  };

  // Check if a param is fully translated
  const isParamFullyTranslated = (paramId) => {
    // 1) Check if param itself is translated
    if (!paramTranslations[paramId] || !paramTranslations[paramId].trim()) {
      return false;
    }

    // 2) Check sub-values
    const values = auctionParameters.filter((ap) => ap.parameter === paramId);
    for (const val of values) {
      const existing = auctionParamTranslations[paramId]?.[val.value_name];
      if (!existing || !existing.trim()) {
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
    saveTranslations(paramTranslations, auctionParamTranslations)
      .then(() => {
        toast.success("Tłumaczenia zostały zapisane!");
      })
      .catch((error) => {
        console.error("Error saving translations:", error);
        toast.error(
          "Wystąpił błąd podczas zapisywania tłumaczeń. Spróbuj ponownie."
        );
      });
  };

  // Render sub-values for a given parameter
  const renderParameterValues = (paramId) => {
    const values = auctionParameters.filter((ap) => ap.parameter === paramId);

    return (
      <VStack spacing={2} align="start" mt={2}>
        {values.map((val) => {
          const uniqueKey = `param-${paramId}-value-${val.value_name}`;
          const valueExists =
            auctionParamTranslations[paramId]?.[val.value_name]?.trim();

          return (
            <Box key={uniqueKey} w="100%">
              <Text fontSize="sm" mb={1}>
                {val.value_name}
              </Text>
              <Input
                size="sm"
                bg={
                  showUntranslatedOnly && !valueExists ? "yellow.100" : "white"
                }
                value={valueExists || ""}
                onChange={(e) =>
                  handleAuctionParamTranslationChange(
                    paramId,
                    val.value_name,
                    e.target.value
                  )
                }
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={6}
      >
        <Text fontSize="2xl" fontWeight="bold">
          Tłumaczenie parametrów
        </Text>
        <Box>
          <Button
            colorScheme="blue"
            mr={2}
            onClick={toggleShowUntranslatedOnly}
          >
            {showUntranslatedOnly
              ? "Pokaż wszystkie"
              : "Pokaż nieprzetłumaczone"}
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
            const paramIsEmpty =
              !translations[key] || !translations[key].trim();

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
                      bg={
                        showUntranslatedOnly &&
                        (!paramTranslations[param.id] ||
                          !paramTranslations[param.id].trim())
                          ? "yellow.100"
                          : "white"
                      }
                      value={paramTranslations[param.id] || ""}
                      onChange={(e) =>
                        handleParamTranslationChange(param.id, e.target.value)
                      }
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
