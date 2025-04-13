// ValuesInput.jsx
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

const ValuesInput = ({ values, setValues }) => {
  const [inputValue, setInputValue] = useState("");

  const addValue = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !values.includes(trimmed)) {
      setValues([...values, trimmed]);
    }
    setInputValue("");
  };

  const removeValue = (index) => {
    const newValues = values.filter((_, i) => i !== index);
    setValues(newValues);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <Box>
      <HStack>
        <Input
          placeholder="Wprowadź wartość"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={addValue} colorScheme="blue">
          Dodaj wartość
        </Button>
      </HStack>
      <HStack spacing={2} mt={2}>
        {values.map((value, index) => (
          <Tag
            size="md"
            key={index}
            borderRadius="full"
            variant="solid"
            colorScheme="blue"
          >
            <TagLabel>{value}</TagLabel>
            <TagCloseButton onClick={() => removeValue(index)} />
          </Tag>
        ))}
      </HStack>
    </Box>
  );
};

export default ValuesInput;
