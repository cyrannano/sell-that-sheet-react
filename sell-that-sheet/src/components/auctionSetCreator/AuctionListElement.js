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
}) => {
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      maxW="100%"
      maxH="125px"
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
          <Button variant="solid" colorScheme="red" onClick={() => {onRemoveAuction()}}>
            Usuń
          </Button>
        </CardFooter>
      </Stack>
    </Card>
  );
};

export default AuctionListElement;
