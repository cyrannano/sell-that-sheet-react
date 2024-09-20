import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth, browseDirectory, getCategoryParameters, createPhotoSet, createCategoryOfferObject, processAuctions } from 'contexts/AuthContext';
import {
  Box,
  SimpleGrid,
  Tab,
  TabPanel,
  TabPanels,
  TabList,
  Tabs,
  ChakraProvider,
  Select,
} from '@chakra-ui/react';
import { Button, ButtonGroup, IconButton } from '@chakra-ui/react'
import { FullFileBrowser, defineFileAction, ChonkyIconName } from 'chonky';
import Card from 'components/card/Card';
import '@silevis/reactgrid/styles.css';
import { CreateProductModal } from './CreateProductModal';
import AuctionSetSheet from './AuctionSetSheet';
import AuctionForm from './AuctionForm';
import { AddIcon, DownloadIcon } from '@chakra-ui/icons';
import { parse } from 'stylis';

const AuctionSetCreator = () => {
  const [folderChain, setFolderChain] = useState([{ id: 'root', name: 'Zdjęcia', fc: true }]);
  const [files, setFiles] = useState([]);
  const [categoryParameters, setCategoryParameters] = useState([]);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [usedCategories, setUsedCategories] = useState([null]);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [photoset, setPhotoset] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await browseDirectory(folderChain);
      setFiles(files);
    };
    fetchFiles();
  }, [folderChain]);

  const fetchCategoryParameters = async (categoryId) => {
    try {
      const response = await createCategoryOfferObject(categoryId);
      return response;
    } catch (error) {
      console.error('Failed to fetch category parameters', error);
      return [];
    }
  };

  // useEffect(() => {
  //   // const fetchCategoryParameters = async () => {
  //   //   const data = await getCategoryParameters(category);
  //   //   setCategoryParameters(data.parameters);

  //   //   const productTemplate = data.parameters.map((param) => [param.id, '']);
  //   //   const newProducts = Array.from({ length: 10 }, () => Object.fromEntries(productTemplate));
  //   //   setCurrentProducts(newProducts);
  //   // };
  //   // fetchCategoryParameters();
  // }, []);

  const handleDownload = () => {
    // parse auctions and prepare for upload
    // upload auction data to api endpoint
    // then
    // call download endpoint with the returned id of auction set
    processAuctions(auctions, folderChain).then((auctionSet) => {
      console.log('Auction Set Created:', auctionSet);
    })
    .catch((error) => {
      console.error('Error processing auctions:', error);
    });

    console.log('Auctions:', auctions);
  };

  const createProduct = async (selectedCategory, productName, folderChain, photos) => {
    console.log(selectedCategory, productName, folderChain, photos);
    if(usedCategories.length == 1 && usedCategories[0] === null) {
      setUsedCategories([selectedCategory]);
    } else if(!usedCategories.map(e => e.id).includes(selectedCategory.id)) {
      setUsedCategories([...usedCategories, selectedCategory]);
      setActiveTabIndex(usedCategories.length - 1);
    }

    setNewProductName(productName);
    setCurrentCategory(selectedCategory.id);
    const photoset = await createPhotoSet(photos.map((e) => e.name), folderChain.filter(e => e.id !== 'root').map((e) => e.name).join('/'), photos[0].name);
    
    console.log('photoset', photoset);
    fetchCategoryParameters(selectedCategory.id).then((data) => {
      let _data = data;
      _data.categoryId = selectedCategory.id;
      _data.map((param) => {
        switch(param.name) {
          case 'photoset':
            param.value = photoset.id;
            break;
          case 'categoryId':
            param.value = selectedCategory.id;
            break;
          case 'name':
            param.value = productName;
            break;
          default:
            break;
        }
      });
      setCategoryParameters(_data);
      setShowCreateProductModal(false);
    });
  };

  const openCreateProductModal = () => {
    setShowCreateProductModal(true);
  };

  const handleFileAction = (action) => {
    switch (action.id) {
      case 'mouse_click_file':
        if(action.payload.clickType !== 'double') {
          break;
        }
        if (action.payload.file && action.payload.file.isDir) {
          setFolderChain((prev) => [
            ...prev,
            { id: action.payload.file.id, name: action.payload.file.name, fc: true },
          ]);
        }

        break;
      case 'go-up':
        setFolderChain((prev) => prev.slice(0, -1));
        break;
      case 'go-home':
        setFolderChain([{ id: 'root', name: 'Zdjęcia', fc: true }]);
        break;
      case 'open_files':
        if (action.payload.files[0].fc) {
          setFolderChain((prev) => [
            ...prev.slice(0, prev.findIndex((item) => item.id === action.payload.files[0].id)),
            { id: action.payload.files[0].id, name: action.payload.files[0].name, fc: true },
          ]);
        }
        break;
      case 'create_auction_product':
        setPhotos(action.state.selectedFiles);
        openCreateProductModal();
        break;
      default:
        break;
    }
  };

  return (
    <Card py="15px">
      <CreateProductModal
        isOpen={showCreateProductModal}
        onClose={() => setShowCreateProductModal(false)}
        createProductFunction={createProduct}
        folderChain={folderChain}
        photos={photos}
        latestCategories={[]}
        setLatestCategories={() => {}}
      />
      <SimpleGrid spacing={5} minHeight="800px">
        <Box height={"500px"}>
          <FullFileBrowser
              overflow="hidden"
              files={files}
              folderChain={folderChain}
              onFileAction={handleFileAction}
              fileActions={[
                defineFileAction({
                  id: 'create_auction_product',
                  hotkeys: ['ctrl+k'],
                  button: {
                    name: 'Utwórz produkt',
                    toolbar: true,
                    contextMenu: true,
                    icon: ChonkyIconName.database,
                    color: 'primary',
                  },
                  requiresSelection: true,
                }),
              ]}
            />
        </Box>
          
        <Tabs overflowX="hidden" onChange={(idx) => {
            setCurrentCategory(usedCategories[idx].id);
            
          }}>
          <ButtonGroup colorScheme={'green'} variant='solid' size='md' isAttached>
            <Button onClick={() => {alert("Jeszcze nie zaimplementowane")}}>Wystaw do Baselinker'a</Button>
            <IconButton onClick={handleDownload} aria-label='Pobierz plik z pakietem' icon={<DownloadIcon/>} />
          </ButtonGroup>
          <TabList>
            {usedCategories.map((category, index) => (
              <Tab key={index}>{category === null ? 'Nowa kategoria' : category.name}</Tab>
            ))}
          </TabList>
          <TabPanels overflowX="scroll">
            {usedCategories.map((_, index) => (
              <TabPanel key={index} p={0} width="100%">
                <ChakraProvider>
                  <Box overflow="auto">
                    <AuctionForm offerObject={categoryParameters} categoryId={currentCategory} auctions={auctions} setAuctions={setAuctions} auctionName={newProductName}/>
                  </Box>
                </ChakraProvider>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
       
      </SimpleGrid>
    </Card>
  );
};

export default AuctionSetCreator;
