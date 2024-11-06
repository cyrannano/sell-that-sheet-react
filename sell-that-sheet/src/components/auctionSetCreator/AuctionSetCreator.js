import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth, browseDirectory, getCategoryParameters, createPhotoSet, createCategoryOfferObject, processAuctions, downloadSheet, pushAuctionSetToBaselinker } from 'contexts/AuthContext';
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
  InputGroup,
  Input,
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
import { ToastContainer, toast } from 'react-toastify';
import { Spinner } from '@chakra-ui/react'
import 'react-toastify/dist/ReactToastify.css';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';


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
  const [auctionSetName, setAuctionSetName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileBrowserImages, setFileBrowserImages] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const fetchFiles = async () => {
    const files = await browseDirectory(folderChain);
    setFiles(files);
  };

  useEffect(() => {
    setCreatingProduct(false);
    fetchFiles();
  }, [folderChain]);

  // when files are updated update fileBrowserImages
  useEffect(() => {
    const images = files.filter((file) => file.name.toLowerCase().match(/\.(jpeg|jpg|png|gif)$/));
    const imagesUrls = images.map((image) => image.thumbnailUrl.replace('thumbnails', 'images'));
    // order images by name
    imagesUrls.sort((a, b) => a.localeCompare(b));
    setFileBrowserImages(imagesUrls);
  }, [files]);


  const fetchCategoryParameters = async (categoryId) => {
    try {
      const response = await createCategoryOfferObject(categoryId);
      return response;
    } catch (error) {
      console.error('Failed to fetch category parameters', error);
      return [];
    }
  };

  const selectAllCategories = () => {
    // setCurrentCategory(null);
    alert('To będzie działało, ale jeszcze nie teraz')
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

  const handleSave = () => {
    processAuctions(auctions, folderChain, auctionSetName).then((auctionSet) => {
      console.log('Auction Set Created:', auctionSet);
      return auctionSet.id;
    })
    .catch((error) => {
      console.error('Error processing auctions:', error);
    });
  };

  const handlePushToBaselinker = () => {
    // push auctions to baselinker
    // save auctionSet
    const auctionSetId = processAuctions(auctions, folderChain, auctionSetName).then((auctionSet) => {

      console.log('Auction Set ID:', auctionSet.id);
      // push to baselinker
      // after push, toast success or error
      
      // during push add spinner
      setLoading(true);

      pushAuctionSetToBaselinker(auctionSet.id).then((response) => {
        console.log('Pushed to Baselinker:', response);
        toast.success('Pomyślnie wystawiono produkty na Baselinkerze');
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error pushing to Baselinker:', error);
        toast.error('Wystąpił błąd podczas wystawiania produktów na Baselinkerze');
        setLoading(false);
      });
    });
  };

  const handleDownload = () => {
    // parse auctions and prepare for upload
    // upload auction data to api endpoint
    // then
    // call download endpoint with the returned id of auction set
    processAuctions(auctions, folderChain, auctionSetName).then((auctionSet) => {
      console.log('Auction Set Created:', auctionSet);
      downloadSheet(auctionSet.id);

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
      setCreatingProduct(true);
      setFiles(photos);
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
        }else if (action.payload.file && action.payload.file.name.toLowerCase().match(/\.(jpeg|jpg|png|gif)$/)) {
          setGalleryOpen(true);
          setPhotoIndex(fileBrowserImages.indexOf(action.payload.file.thumbnailUrl.replace('thumbnails', 'images')));
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
    <>
    {/* if loading add overlay with spinner and blur everything below */}
    {loading && <Box position="fixed" top="0" left="0" width="100%" height="100%" bg="rgba(0,0,0,0.5)" zIndex="1000" display="flex" justifyContent="center" alignItems="center">
      <Spinner />
    </Box>}
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
          {creatingProduct ? <Button colorScheme={'red'} onClick={() => {setCreatingProduct(false); fetchFiles(folderChain);}}>Anuluj</Button> : <></>}
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
        <Box>
        <Tabs overflowX="hidden" onChange={(idx) => {
            if (idx === usedCategories.length) {
              selectAllCategories();
              setActiveTabIndex(0);
              return;
            }
            setCurrentCategory(usedCategories[idx].id);
            
          }}>
          <InputGroup>
            <ButtonGroup colorScheme={'green'} variant='solid' size='md' isAttached>
              <Button onClick={handlePushToBaselinker}>Wystaw do Baselinker'a</Button>
              <IconButton onClick={handleDownload} aria-label='Pobierz plik z pakietem' icon={<DownloadIcon/>} />
              <IconButton onClick={handleSave} aria-label='Zapisz pakiet' icon={<AddIcon/>} />
            </ButtonGroup>
            <Input placeholder="Nazwa pakietu" ml='5px' size='md' onChange={(e) => setAuctionSetName(e.target.value)} />
          </InputGroup>
          <TabList>
            {usedCategories.map((category, index) => (
              <Tab key={index}>{category === null ? 'Nowa kategoria' : category.name}</Tab>
            ))}
            <Tab key={-1}>Wszystkie</Tab>
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
        </Box>
       
      </SimpleGrid>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition="Bounce"
        />
        {/* Same as */}
      <ToastContainer />
    </Card>
    {galleryOpen && (
        <Lightbox
          mainSrc={fileBrowserImages[photoIndex]}
          nextSrc={fileBrowserImages[(photoIndex + 1) % fileBrowserImages.length]}
          prevSrc={fileBrowserImages[(photoIndex + fileBrowserImages.length - 1) % fileBrowserImages.length]}
          onCloseRequest={() => setGalleryOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex((photoIndex + fileBrowserImages.length - 1) % fileBrowserImages.length)
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % fileBrowserImages.length)
          }
        />
      )}
    </>
  );
};

export default AuctionSetCreator;
