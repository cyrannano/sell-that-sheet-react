// ValuePairsInput.jsx
import React, { useState } from "react";
import {
  Box,
  HStack,
  Input,
  Button,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";

const ValuePairsInput = ({ pairs, setPairs }) => {
  const [plValue, setPlValue] = useState("");
  const [deValue, setDeValue] = useState("");

  const addPair = () => {
    const pl = plValue.trim();
    const de = deValue.trim();
    if (!pl || !de) return;
    // avoid duplicate PL↔DE pair
    if (pairs.some((p) => p.pl === pl && p.de === de)) {
      setPlValue("");
      setDeValue("");
      return;
    }
    setPairs([...pairs, { pl, de }]);
    setPlValue("");
    setDeValue("");
  };

  const removePair = (idx) => {
    setPairs(pairs.filter((_, i) => i !== idx));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPair();
    }
  };

  return (
    <Box>
      <HStack>
        <Input
          placeholder="Wartość PL"
          value={plValue}
          onChange={(e) => setPlValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Input
          placeholder="Wartość DE"
          value={deValue}
          onChange={(e) => setDeValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={addPair} colorScheme="blue" w={"250px"}>
          Dodaj parę
        </Button>
      </HStack>
      <HStack spacing={2} mt={2}>
        {pairs.map((pair, index) => (
          <Tag
            key={index}
            size="md"
            borderRadius="full"
            variant="solid"
            colorScheme="blue"
          >
            <TagLabel>
              {pair.pl} ↔ {pair.de}
            </TagLabel>
            <TagCloseButton onClick={() => removePair(index)} />
          </Tag>
        ))}
      </HStack>
    </Box>
  );
};

export default ValuePairsInput;
