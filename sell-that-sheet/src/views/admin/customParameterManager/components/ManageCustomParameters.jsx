// ManageCustomParameters.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Text,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  getCustomCategoryParameters,
  deleteCategoryParameter,
} from "contexts/AuthContext";
import EditParameterModal from "./EditParameterModal";
import { getCategoryById } from "contexts/AuthContext";

// Subcomponent to asynchronously fetch and display the category name
const CategoryName = ({ categoryId }) => {
  const [name, setName] = useState("Ładowanie...");
  useEffect(() => {
    const fetchName = async () => {
      try {
        const category = await getCategoryById(categoryId);
        setName(category.name);
      } catch (error) {
        console.error("Błąd podczas pobierania kategorii:", error);
        setName("Nie znaleziono kategorii");
      }
    };
    fetchName();
  }, [categoryId]);
  return <span>{name}</span>;
};

const ManageCustomParameters = ({ refresh }) => {
  const [parameters, setParameters] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const toast = useToast();

  const fetchParameters = async () => {
    try {
      const response = await getCustomCategoryParameters("");
      setParameters(response);
    } catch (error) {
      console.error("Błąd podczas pobierania parametrów:", error);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten parametr?")) {
      return;
    }
    try {
      await deleteCategoryParameter(id);
      toast({
        title: "Parametr usunięty",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      fetchParameters();
    } catch (error) {
      toast({
        title: "Błąd podczas usuwania parametru",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      console.error("Błąd usuwania:", error);
    }
  };

  const handleEdit = (parameter) => {
    setSelectedParameter(parameter);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedParameter(null);
    fetchParameters();
  };

  return (
    <Box mt={6}>
      <Heading size="md" mb={4}>
        Zarządzaj parametrami
      </Heading>
      {parameters.length === 0 ? (
        <Text>Brak parametrów.</Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Kategoria</Th>
              <Th>Nazwa (PL)</Th>
              <Th>Typ</Th>
              <Th>Możliwe wartości (PL)</Th>
              <Th>Akcje</Th>
            </Tr>
          </Thead>
          <Tbody>
            {parameters.map((param) => (
              <Tr key={param.id}>
                <Td>{param.id}</Td>
                <Td>
                  <CategoryName categoryId={param.category_id.trim()} />
                </Td>
                <Td>{param.name_pl}</Td>
                <Td>
                  {param.parameter_type === "single" &&
                    "Lista (jednokrotny wybór)"}
                  {param.parameter_type === "multi" &&
                    "Checkbox (wielokrotny wybór)"}
                  {param.parameter_type === "numeric" && "Liczbowy"}
                  {param.parameter_type === "text" && "Tekstowy"}
                </Td>
                <Td>
                  {param.possible_values_pl
                    ? param.possible_values_pl.join(", ")
                    : "-"}
                </Td>
                <Td>
                  <IconButton
                    aria-label="Edytuj"
                    icon={<EditIcon />}
                    mr={2}
                    onClick={() => handleEdit(param)}
                  />
                  <IconButton
                    aria-label="Usuń"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDelete(param.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {isEditModalOpen && selectedParameter && (
        <EditParameterModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          parameter={selectedParameter}
        />
      )}
    </Box>
  );
};

export default ManageCustomParameters;
