import React from "react";
import {
  Card,
  Image,
  Stack,
  CardBody,
  Heading,
  CardFooter,
  Button,
} from "@chakra-ui/react";
import { List, ListItem, OrderedList } from "@chakra-ui/react";

const AuctionListElement = ({
  name,
  thumbnail,
  onEditAuction,
  onRemoveAuction,
  selected,
}) => {
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      border={selected ? "1px solid" : null}
      maxW="100%"
      maxH="125px"
      bg={selected ? "rgba(78, 56, 251, 0.05)" : null}
      size="sm"
      cursor="pointer"
      onClick={() => onEditAuction()}
    >
      <Image
        objectFit="cover"
        maxW={{ base: "100%", sm: "200px" }}
        src={thumbnail}
        alt={name}
      />

      <Stack>
        <CardBody maxH="50%" overflow="hidden">
          <Heading size="sm">{name}</Heading>
        </CardBody>

        <CardFooter>
          <Button variant="solid" size='xs' colorScheme="red" onClick={() => {onRemoveAuction()}}>
            Usuń
          </Button>
        </CardFooter>
      </Stack>
    </Card>
  );
};

export default AuctionListElement;
