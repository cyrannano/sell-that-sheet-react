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
  fetchTags,
  createTag,
  removeTag,
  changeTag,
} from "contexts/AuthContext";

const TagsManager = () => {
  const [tags, setTags] = useState([]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("pl"); // Default to Polish 🇵🇱

  useEffect(() => {
    loadTags();
  }, [language]); // Reload when language changes

  const debouncedUpdateRef = useRef();

  const loadTags = async () => {
    try {
      const response = await fetchTags(language);
      console.log("Fetched Tags:", response);
      setTags(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      setTags([]);
    }
  };

  const addTag = async () => {
    if (!key || !value) return;
    try {
      await createTag(key, value, language);
      setKey("");
      setValue("");
      loadTags();
    } catch (error) {
      console.error("Failed to add tag:", error.response?.data || error);
    }
  };

  const deleteTag = async (id) => {
    try {
      await removeTag(id, language);
      loadTags();
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const updateTag = async (id, newValue) => {
    if (!debouncedUpdateRef.current) {
      debouncedUpdateRef.current = debounce(async (id, newValue) => {
        try {
          await changeTag(id, newValue);
          loadTags();
        } catch (error) {
          console.error("Failed to update tag:", error);
        }
      }, 1000);
    }

    debouncedUpdateRef.current(id, newValue);
  };

  return (
    <Box p={4} maxW="800px" width="800px" mx="auto">
      <Heading size="lg" mb={4}>
        Własne Tagi
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
          placeholder="Tag"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <Textarea
          placeholder="Wartość"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="sm"
          resize="vertical"
        />
        <Button colorScheme="blue" onClick={addTag}>
          Dodaj
        </Button>
      </HStack>

      <List spacing={3}>
        {tags.length > 0 ? (
          tags.map((tag) => (
            <ListItem key={tag.id} p={2} borderWidth={1} borderRadius="md">
              <HStack justify="space-between">
                <VStack align="start" width={"100%"}>
                  <Heading size="sm">{tag.key}</Heading>
                  <Textarea
                    value={tag.value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setTags((prevTags) => {
                        const newTags = prevTags.map((t) =>
                          t.id === tag.id ? { ...t, value: newValue } : t
                        );
                        updateTag(tag.id, newValue);
                        return newTags;
                      });
                    }}
                    size="sm"
                    resize="vertical"
                  />
                </VStack>
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => deleteTag(tag.id)}
                />
              </HStack>
            </ListItem>
          ))
        ) : (
          <Heading size="sm" textAlign="center" color="gray.500">
            Brak tagów
          </Heading>
        )}
      </List>
    </Box>
  );
};

export default TagsManager;
