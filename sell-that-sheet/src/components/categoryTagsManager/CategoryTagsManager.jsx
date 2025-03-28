import { useEffect, useState, useRef } from "react";
import debounce from "lodash.debounce";
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
  getCategoryById,
} from "contexts/AuthContext";

const CategoryTagsManager = () => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("pl");
  const [categoryNames, setCategoryNames] = useState({});

  useEffect(() => {
    loadCategories();
  }, [language]);

  const debouncedUpdateRef = useRef();

  const resolveCategoryName = async (id) => {
    if (categoryNames[id]) return; // Already cached

    try {
      const data = await getCategoryById(id);
      setCategoryNames((prev) => ({ ...prev, [id]: data.name }));
    } catch (error) {
      console.error(`Failed to fetch category name for ID ${id}:`, error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetchCategoryTags(language);
      setCategories(Array.isArray(response) ? response : []);

      // Resolve names
      await Promise.all(
        response.map((cat) => resolveCategoryName(cat.category_id))
      );
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

  const handleUpdateCategory = (id, newTags, lang) => {
    if (!debouncedUpdateRef.current) {
      debouncedUpdateRef.current = debounce(async (id, value, lang) => {
        try {
          await changeCategoryTag(id, value, lang);
        } catch (error) {
          console.error("Failed to update category tag:", error);
        }
      }, 1000);
    }

    debouncedUpdateRef.current(id, newTags, lang);
  };

  return (
    <Box p={4} maxW="800px" width="800px" mx="auto">
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
                <VStack width="100%" align="start">
                  <Heading size="sm">
                    {categoryNames[category.category_id]
                      ? `${categoryNames[category.category_id]} (ID: ${
                          category.category_id
                        })`
                      : `ID: ${category.category_id}`}
                  </Heading>
                  <Textarea
                    value={category.tags}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setCategories((prev) =>
                        prev.map((cat) =>
                          cat.id === category.id
                            ? { ...cat, tags: newValue }
                            : cat
                        )
                      );
                      handleUpdateCategory(category.id, newValue, language);
                    }}
                    size="sm"
                    resize="both"
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
