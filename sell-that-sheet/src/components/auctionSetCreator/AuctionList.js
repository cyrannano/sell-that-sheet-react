import React, { useEffect, useState } from 'react';
import { Box, Heading, Spinner } from '@chakra-ui/react';
import AuctionListElement from './AuctionListElement';
import { getPhotosetThumbnailURL } from 'contexts/AuthContext';

const AuctionList = ({ auctions, onEditAuction, onRemoveAuction, selectedAuction }) => {
    const [thumbnails, setThumbnails] = useState([]);  // Store the resolved thumbnail URLs
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchThumbnails = async () => {
            if (auctions && Array.isArray(auctions)) {
                const urls = await Promise.all(auctions.map(auction => getPhotosetThumbnailURL(auction.photosetBase)));
                setThumbnails(urls);
                setLoading(false);
            }
        };

        fetchThumbnails();
    }, [auctions]);  // Fetch thumbnails whenever the auctions prop changes

    if (loading) {
        return <Spinner size="xl" />;
    }

    return (
        <Box>
            <Heading size='md'>Aukcje</Heading>
            <Box>
                {auctions && Array.isArray(auctions) && auctions.map((auction, index) => (
                    <AuctionListElement 
                        selected={selectedAuction === auction.id}
                        key={index} 
                        thumbnail={thumbnails[index]}  // Use the resolved thumbnail URL from state
                        name={auction.nameBase} 
                        onEditAuction={() => onEditAuction(auction.id)} 
                        onRemoveAuction={() => onRemoveAuction(auction.id)} 
                    />
                ))}
            </Box>
        </Box>
    );
};

export default AuctionList;
