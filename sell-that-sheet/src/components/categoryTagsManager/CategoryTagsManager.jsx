import { useEffect, useState } from "react";
import {
  Box,
  Input,
  Button,
  List,
  ListItem,
  IconButton,
  Heading,
  HStack,
  VStack,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  fetchCategoryTags,
  createCategoryTag,
  removeCategoryTag,
  changeCategoryTag,
} from "contexts/AuthContext";

const CategoryTagsManager = () => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("pl");

  useEffect(() => {
    loadCategories();
  }, [language]);

  const loadCategories = async () => {
    try {
      const response = await fetchCategoryTags(language);
      console.log("Fetched Categories:", response);
      setCategories(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const addCategory = async () => {
    if (!categoryId || !tags) return;
    try {
      await createCategoryTag(categoryId, tags, language);
      setCategoryId("");
      setTags("");
      loadCategories();
    } catch (error) {
      console.error(
        "Failed to add category tag:",
        error.response?.data || error
      );
    }
  };

  const deleteCategory = async (id) => {
    try {
      await removeCategoryTag(id, language);
      loadCategories();
    } catch (error) {
      console.error("Failed to delete category tag:", error);
    }
  };

  const updateCategory = async (id, newTags) => {
    try {
      await changeCategoryTag(id, newTags);
      loadCategories();
    } catch (error) {
      console.error("Failed to update category tag:", error);
    }
  };

  return (
    <Box p={4} maxW="600px" mx="auto">
      <Heading size="lg" mb={4}>
        Kategorie
      </Heading>

      {/* Language Selector */}
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        mb={4}
      >
        <option value="pl">🇵🇱 Polski</option>
        <option value="de">🇩🇪 Deutsch</option>
      </Select>

      <HStack mb={4}>
        <Input
          placeholder="Numer kategorii"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
        <Textarea
          placeholder="Tagi"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          size="sm"
          resize="vertical"
        />
        <Button colorScheme="blue" onClick={addCategory}>
          Dodaj
        </Button>
      </HStack>

      <List spacing={3}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <ListItem key={category.id} p={2} borderWidth={1} borderRadius="md">
              <HStack justify="space-between">
                <VStack align="start">
                  <Heading size="sm">ID: {category.category_id}</Heading>
                  <Textarea
                    value={category.tags}
                    onChange={(e) =>
                      updateCategory(category.id, e.target.value)
                    }
                    size="sm"
                    resize="vertical"
                  />
                </VStack>
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => deleteCategory(category.id)}
                />
              </HStack>
            </ListItem>
          ))
        ) : (
          <Heading size="sm" textAlign="center" color="gray.500">
            Brak kategorii
          </Heading>
        )}
      </List>
    </Box>
  );
};

export default CategoryTagsManager;
