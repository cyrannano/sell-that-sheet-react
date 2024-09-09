import React from 'react';
import { Box, Button, Spinner } from '@chakra-ui/react';
import { List, ListItem, OrderedList } from '@chakra-ui/react';

const AuctionList = ({auctions, onEditAuction, onRemoveAuction}) => {
    return (
        // print out all auctions in a list if auctions is not empty and is an array
        <Box>
            <h2>Aukcje</h2>
            <OrderedList spacing={2}>
                {auctions && Array.isArray(auctions) && auctions.map((auction, index) => (
                    <ListItem onClick={() => onEditAuction(index)} key={index} cursor={'pointer'}>
                        {auction.nameBase}
                        <Button onClick={() => onRemoveAuction(index)} colorScheme="red" size="xs" ml={2}>
                            Usuń
                        </Button>
                    </ListItem>
                ))}
            </OrderedList>
        </Box>
    );
};

export default AuctionList;