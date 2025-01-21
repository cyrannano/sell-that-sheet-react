import React, { useState } from "react";
import {
  Box,
  Image,
  Text,
  IconButton,
  Grid,
  GridItem,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { CloseIcon, StarIcon } from "@chakra-ui/icons";

const SelectedImagesBrowser = ({ imageList, setImageList, onThumbnailChange, onProductImageDelete }) => {
  const [mainThumbnailId, setMainThumbnailId] = useState(null);
  const toast = useToast();

  const handleDelete = (id) => {
    const updatedList = imageList.filter((image) => image.imageId !== id);
    setImageList(updatedList);

    // Reset main thumbnail if deleted
    if (mainThumbnailId === id) {
      setMainThumbnailId(null);
    }

    toast({
      title: "Image deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });

    onProductImageDelete(id);
  };

  const handleSelectMainThumbnail = (id) => {
    setMainThumbnailId(id);
    onThumbnailChange(id);

    toast({
      title: "Wybrano miniaturę",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4} overflowY={"scroll"}>
      {imageList.map((image) => (
        <GridItem key={image.imageId} position="relative">
          <Box
            border="2px solid"
            borderColor={mainThumbnailId === image.imageId ? "teal.400" : "gray.200"}
            borderRadius="md"
            overflow="hidden"
            boxShadow="md"
            position="relative"
            _hover={{ borderColor: "teal.600" }}
          >
            <Image src={image.thumbnailUrl} alt={image.name} objectFit="cover" />
            <Tooltip label="Usuń zdjęcie" placement="top">
              <IconButton
                icon={<CloseIcon />}
                aria-label="Usuń zdjęcie"
                size="sm"
                position="absolute"
                top={2}
                right={2}
                onClick={() => handleDelete(image.imageId)}
              />
            </Tooltip>
            <Tooltip label="Ustaw jako miniaturę" placement="top">
              <IconButton
                icon={<StarIcon />}
                aria-label="Ustaw jako miniaturę"
                size="sm"
                position="absolute"
                bottom={2}
                right={2}
                colorScheme={mainThumbnailId === image.imageId ? "teal" : "gray"}
                onClick={() => handleSelectMainThumbnail(image.imageId)}
              />
            </Tooltip>
            <Box p={2} bg="gray.50">
              <Text fontSize="sm" isTruncated>
                {image.name}
              </Text>
            </Box>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
};

export default SelectedImagesBrowser;
