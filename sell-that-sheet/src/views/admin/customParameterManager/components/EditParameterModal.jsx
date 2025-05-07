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
import ValuePairsInput from "./ValuePairsInput";

const EditParameterModal = ({ isOpen, onClose, parameter }) => {
  const [categoryId, setCategoryId] = useState(parameter.category_id || "");
  const [namePl, setNamePl] = useState(parameter.name_pl);
  const [nameDe, setNameDe] = useState(parameter.name_de);
  const [parameterType, setParameterType] = useState(parameter.parameter_type);
  const [valuePairs, setValuePairs] = useState([]);

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Initialize pairs from existing arrays
    const pls = parameter.possible_values_pl || [];
    const des = parameter.possible_values_de || [];
    const pairs = pls.map((pl, idx) => ({ pl, de: des[idx] || "" }));
    setValuePairs(pairs);
  }, [parameter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCategoryParameter(parameter.id, {
        category_id: categoryId.trim() || null,
        name_pl: namePl,
        name_de: nameDe,
        parameter_type: parameterType,
        possible_values_pl: ["single", "multi"].includes(parameterType)
          ? valuePairs.map((p) => p.pl)
          : null,
        possible_values_de: ["single", "multi"].includes(parameterType)
          ? valuePairs.map((p) => p.de)
          : null,
      });
      toast({
        title: "Zaktualizowano parametr.",
        status: "success",
        duration: 2000,
      });
      onClose();
    } catch {
      toast({
        title: "Błąd podczas aktualizacji.",
        status: "error",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edytuj parametr</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form id="edit-form" onSubmit={handleSubmit}>
            <FormControl mb={4}>
              <FormLabel>ID kategorii (opcjonalnie)</FormLabel>
              <Input
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="ID kategorii"
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Nazwa (PL)</FormLabel>
              <Input
                value={namePl}
                onChange={(e) => setNamePl(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Nazwa (DE)</FormLabel>
              <Input
                value={nameDe}
                onChange={(e) => setNameDe(e.target.value)}
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

            {["single", "multi"].includes(parameterType) && (
              <FormControl mb={4}>
                <FormLabel>Możliwe wartości (PL ↔ DE)</FormLabel>
                <ValuePairsInput pairs={valuePairs} setPairs={setValuePairs} />
              </FormControl>
            )}
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Anuluj
          </Button>
          <Button
            colorScheme="blue"
            form="edit-form"
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
