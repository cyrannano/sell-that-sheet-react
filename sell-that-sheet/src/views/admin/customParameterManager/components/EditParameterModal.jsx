// EditParameterModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
} from "@chakra-ui/react";
import { updateCategoryParameter } from "contexts/AuthContext";
import ValuesInput from "./ValuesInput";

const EditParameterModal = ({ isOpen, onClose, parameter }) => {
  // Set up local states including category_id
  const [categoryId, setCategoryId] = useState(parameter.category_id || "");
  const [namePl, setNamePl] = useState(parameter.name_pl || "");
  const [nameDe, setNameDe] = useState(parameter.name_de || "");
  const [parameterType, setParameterType] = useState(parameter.parameter_type);
  const [possibleValuesPl, setPossibleValuesPl] = useState(
    parameter.possible_values_pl
      ? Array.isArray(parameter.possible_values_pl)
        ? parameter.possible_values_pl
        : parameter.possible_values_pl.split(",").map((val) => val.trim())
      : []
  );
  const [possibleValuesDe, setPossibleValuesDe] = useState(
    parameter.possible_values_de
      ? Array.isArray(parameter.possible_values_de)
        ? parameter.possible_values_de
        : parameter.possible_values_de.split(",").map((val) => val.trim())
      : []
  );
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (parameter) {
      setCategoryId(parameter.category_id || "");
      setNamePl(parameter.name_pl || "");
      setNameDe(parameter.name_de || "");
      setParameterType(parameter.parameter_type);
      setPossibleValuesPl(
        parameter.possible_values_pl
          ? Array.isArray(parameter.possible_values_pl)
            ? parameter.possible_values_pl
            : parameter.possible_values_pl.split(",").map((val) => val.trim())
          : []
      );
      setPossibleValuesDe(
        parameter.possible_values_de
          ? Array.isArray(parameter.possible_values_de)
            ? parameter.possible_values_de
            : parameter.possible_values_de.split(",").map((val) => val.trim())
          : []
      );
    }
  }, [parameter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let valuesPl = null;
    let valuesDe = null;
    if (parameterType === "single" || parameterType === "multi") {
      valuesPl = possibleValuesPl;
      valuesDe = possibleValuesDe;
    }
    try {
      await updateCategoryParameter(parameter.id, {
        category_id: categoryId,
        name_pl: namePl,
        name_de: nameDe,
        parameter_type: parameterType,
        possible_values_pl:
          parameterType === "single" || parameterType === "multi"
            ? valuesPl
            : null,
        possible_values_de:
          parameterType === "single" || parameterType === "multi"
            ? valuesDe
            : null,
      });
      toast({
        title: "Parametr został zaktualizowany pomyślnie.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Błąd podczas aktualizacji parametru.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      console.error("Błąd aktualizacji:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxW="800px">
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader>Edytuj parametr</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form id="edit-param-form" onSubmit={handleSubmit}>
            <FormControl mb={4} isRequired>
              <FormLabel>ID kategorii</FormLabel>
              <Input
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="Wprowadź ID kategorii"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Nazwa parametru (PL)</FormLabel>
              <Input
                value={namePl}
                onChange={(e) => setNamePl(e.target.value)}
                placeholder="Wprowadź nową nazwę po polsku"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Nazwa parametru (DE)</FormLabel>
              <Input
                value={nameDe}
                onChange={(e) => setNameDe(e.target.value)}
                placeholder="Wprowadź nową nazwę po niemiecku"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
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
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Anuluj
          </Button>
          <Button
            colorScheme="blue"
            form="edit-param-form"
            type="submit"
            isLoading={loading}
          >
            Zapisz zmiany
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditParameterModal;
