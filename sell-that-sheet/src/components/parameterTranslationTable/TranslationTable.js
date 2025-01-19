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
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { getAllAuctionParameters, getAllParameters } from "contexts/AuthContext";


const TranslationTable = () => {
  const [parameters, setParameters] = useState([]);
  const [auctionParameters, setAuctionParameters] = useState([]);
  const [translations, setTranslations] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const params = await getAllParameters();
      const auctionParams = await getAllAuctionParameters();

      setParameters(params);
      setAuctionParameters(auctionParams);
    };

    fetchData();
  }, []);

  const handleExpand = (paramId) => {
    setExpanded((prev) => ({ ...prev, [paramId]: !prev[paramId] }));
  };

  const handleTranslationChange = (key, value) => {
    setTranslations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderParameterValues = (paramId) => {
    const values = auctionParameters.filter((ap) => ap.parameter === paramId);

    return (
      <VStack spacing={2} align="start" mt={2}>
        {values.map((val) => {
          const key = `param-${paramId}-value-${val.value_id}`;
          return (
            <Box key={key} w="100%">
              <Text fontSize="sm" mb={1}>
                {val.value_name}
              </Text>
              <Input
                size="sm"
                value={translations[key] || ""}
                onChange={(e) => handleTranslationChange(key, e.target.value)}
                placeholder={`Translate "${val.value_name}"`}
              />
            </Box>
          );
        })}
      </VStack>
    );
  };

  return (
    <Box p={6} maxW="800px" mx="auto">
      <Text fontSize="2xl" mb={6} fontWeight="bold">
        Parameter Translation Table
      </Text>
      <Table variant="striped" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>Original</Th>
            <Th>Translation</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {parameters.map((param) => {
            const key = `param-${param.id}`;
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
                        aria-label="Expand/Collapse"
                      />
                      <Text ml={2}>{param.name}</Text>
                    </Box>
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      value={translations[key] || ""}
                      onChange={(e) => handleTranslationChange(key, e.target.value)}
                      placeholder={`Translate "${param.name}"`}
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
