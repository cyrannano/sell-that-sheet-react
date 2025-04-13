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
import ValuesInput from "./ValuesInput";

const AddCustomParameter = ({ onParameterAdded }) => {
  // State for category lookup
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [lookupError, setLookupError] = useState("");

  // State for parameter form for multiple languages
  const [parameterNamePl, setParameterNamePl] = useState("");
  const [parameterNameDe, setParameterNameDe] = useState("");
  const [parameterType, setParameterType] = useState("text");
  const [possibleValuesPl, setPossibleValuesPl] = useState([]); // Polish values array
  const [possibleValuesDe, setPossibleValuesDe] = useState([]); // German values array

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  // Lookup category name based on input ID
  const fetchCategoryName = async () => {
    setLookupError("");
    setCategoryName("");
    if (!categoryId.trim()) {
      setLookupError("Proszę podać ID kategorii.");
      return;
    }
    try {
      const category = await getCategoryById(categoryId.trim());
      setCategoryName(category.name);
    } catch (error) {
      setLookupError("Nie znaleziono kategorii o podanym ID.");
      console.error("Błąd wyszukiwania kategorii:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess("");
    if (!categoryId.trim() || !categoryName) {
      setSubmitError(
        "Proszę podać poprawne ID kategorii i wyszukać jej nazwę."
      );
      return;
    }
    if (!parameterNamePl.trim() || !parameterNameDe.trim()) {
      setSubmitError(
        "Wymagane są nazwy parametru w języku polskim i niemieckim."
      );
      return;
    }
    if (parameterType === "single" || parameterType === "multi") {
      if (possibleValuesPl.length === 0) {
        setSubmitError("Proszę dodać przynajmniej jedną wartość (PL).");
        return;
      }
      if (possibleValuesDe.length === 0) {
        setSubmitError("Proszę dodać przynajmniej jedną wartość (DE).");
        return;
      }
    }
    setLoading(true);
    try {
      await createCategoryParameter({
        category_id: categoryId.trim(),
        name_pl: parameterNamePl.trim(),
        name_de: parameterNameDe.trim(),
        parameter_type: parameterType,
        possible_values_pl:
          parameterType === "single" || parameterType === "multi"
            ? possibleValuesPl
            : null,
        possible_values_de:
          parameterType === "single" || parameterType === "multi"
            ? possibleValuesDe
            : null,
      });
      setSuccess("Parametr został pomyślnie dodany.");
      // Reset the parameter form (keeping category details)
      setParameterNamePl("");
      setParameterNameDe("");
      setParameterType("text");
      setPossibleValuesPl([]);
      setPossibleValuesDe([]);
      if (onParameterAdded) onParameterAdded();
    } catch (err) {
      setSubmitError("Błąd podczas dodawania parametru.");
      console.error("Błąd API:", err.response?.data || err);
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
        <FormLabel>ID kategorii</FormLabel>
        <Input
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          placeholder="Wprowadź ID kategorii"
        />
        <Button mt={2} onClick={fetchCategoryName} size="sm" colorScheme="blue">
          Wyszukaj kategorię
        </Button>
        {lookupError && (
          <Text color="red.500" mt={2}>
            {lookupError}
          </Text>
        )}
        {categoryName && (
          <Text mt={2} fontWeight="bold">
            Kategoria: {categoryName}
          </Text>
        )}
      </FormControl>

      <FormControl isRequired mb={4}>
        <FormLabel>Nazwa parametru (PL)</FormLabel>
        <Input
          value={parameterNamePl}
          onChange={(e) => setParameterNamePl(e.target.value)}
          placeholder="Wprowadź nazwę parametru po polsku"
        />
      </FormControl>

      <FormControl isRequired mb={4}>
        <FormLabel>Nazwa parametru (DE)</FormLabel>
        <Input
          value={parameterNameDe}
          onChange={(e) => setParameterNameDe(e.target.value)}
          placeholder="Wprowadź nazwę parametru po niemiecku"
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

      {(parameterType === "single" || parameterType === "multi") && (
        <>
          <FormControl mb={4}>
            <FormLabel>Możliwe wartości (PL)</FormLabel>
            <ValuesInput
              values={possibleValuesPl}
              setValues={setPossibleValuesPl}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Możliwe wartości (DE)</FormLabel>
            <ValuesInput
              values={possibleValuesDe}
              setValues={setPossibleValuesDe}
            />
          </FormControl>
        </>
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
