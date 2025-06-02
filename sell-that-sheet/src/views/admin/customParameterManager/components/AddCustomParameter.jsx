// AddCustomParameter.jsx
import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Text,
} from "@chakra-ui/react";
import { getCategoryById, createCategoryParameter } from "contexts/AuthContext";
import ValuePairsInput from "./ValuePairsInput";

const AddCustomParameter = ({ onParameterAdded }) => {
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [lookupError, setLookupError] = useState("");

  const [parameterNamePl, setParameterNamePl] = useState("");
  const [parameterNameDe, setParameterNameDe] = useState("");
  const [parameterType, setParameterType] = useState("text");
  const [valuePairs, setValuePairs] = useState([]);
  const [separator, setSeparator] = useState("|");

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCategoryName = async () => {
    if (categoryId === null) {
      setCategoryName("Parametr uniwersalny");
      return;
    }
    setLookupError("");
    setCategoryName("");
    const id = categoryId.trim();
    if (!id) return;
    try {
      const category = await getCategoryById(id);
      setCategoryName(category.name);
    } catch {
      setLookupError("Nie znaleziono kategorii o podanym ID.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess("");

    // Only validate category lookup if user entered an ID
    if (categoryId.trim() && !categoryName) {
      setSubmitError("Jeśli podałeś ID kategorii, musisz wyszukać jej nazwę.");
      return;
    }

    if (!parameterNamePl.trim() || !parameterNameDe.trim()) {
      setSubmitError("Wymagane są nazwy parametru w obu językach.");
      return;
    }
    if (
      (parameterType === "single" || parameterType === "multi") &&
      valuePairs.length === 0
    ) {
      setSubmitError("Proszę dodać przynajmniej jedną parę wartości.");
      return;
    }

    setLoading(true);
    try {
      await createCategoryParameter({
        category_id: categoryId.trim() || null,
        name_pl: parameterNamePl.trim(),
        name_de: parameterNameDe.trim(),
        parameter_type: parameterType,
        possible_values_pl: ["single", "multi"].includes(parameterType)
          ? valuePairs.map((p) => p.pl)
          : null,
        possible_values_de: ["single", "multi"].includes(parameterType)
          ? valuePairs.map((p) => p.de)
          : null,
        separator: parameterType === "multi" ? separator.trim() || "|" : null,
      });
      setSuccess("Parametr został dodany.");
      setParameterNamePl("");
      setParameterNameDe("");
      setParameterType("text");
      setValuePairs([]);
      if (onParameterAdded) onParameterAdded();
    } catch {
      setSubmitError("Błąd podczas dodawania parametru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={4}
      borderWidth="1px"
      borderRadius="md"
    >
      <FormControl mb={4}>
        <FormLabel>ID kategorii (opcjonalnie)</FormLabel>
        <Input
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          placeholder="Wprowadź ID kategorii"
        />
        <Button mt={2} size="sm" colorScheme="blue" onClick={fetchCategoryName}>
          Wyszukaj kategorię
        </Button>
        {lookupError && <Text color="red.500">{lookupError}</Text>}
        {categoryName && (
          <Text fontWeight="bold">Kategoria: {categoryName}</Text>
        )}
      </FormControl>

      <FormControl isRequired mb={4}>
        <FormLabel>Nazwa parametru (PL)</FormLabel>
        <Input
          value={parameterNamePl}
          onChange={(e) => setParameterNamePl(e.target.value)}
          placeholder="Wprowadź nazwę po polsku"
        />
      </FormControl>

      <FormControl isRequired mb={4}>
        <FormLabel>Nazwa parametru (DE)</FormLabel>
        <Input
          value={parameterNameDe}
          onChange={(e) => setParameterNameDe(e.target.value)}
          placeholder="Wprowadź nazwę po niemiecku"
        />
      </FormControl>

      <FormControl isRequired mb={4}>
        <FormLabel>Typ parametru</FormLabel>
        <Select
          value={parameterType}
          onChange={(e) => setParameterType(e.target.value)}
        >
          <option value="single">Lista (jednokrotny wybór)</option>
          <option value="multi">Checkbox (wielokrotny wybór)</option>
          <option value="numeric">Liczbowy</option>
          <option value="text">Tekstowy</option>
        </Select>
      </FormControl>

      {parameterType === "multi" && (
        <FormControl mb={4}>
          <FormLabel>Separator</FormLabel>
          <Input
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            placeholder="Wprowadź separator (domyślnie: |)"
            defaultValue="|"
            maxLength={10}
          />
        </FormControl>
      )}

      {["single", "multi"].includes(parameterType) && (
        <FormControl mb={4}>
          <FormLabel>Możliwe wartości (PL ↔ DE)</FormLabel>
          <ValuePairsInput pairs={valuePairs} setPairs={setValuePairs} />
        </FormControl>
      )}

      {submitError && (
        <Text color="red.500" mb={4}>
          {submitError}
        </Text>
      )}
      {success && (
        <Text color="green.500" mb={4}>
          {success}
        </Text>
      )}

      <Button type="submit" colorScheme="blue" isLoading={loading}>
        Dodaj parametr
      </Button>
    </Box>
  );
};

export default AddCustomParameter;
