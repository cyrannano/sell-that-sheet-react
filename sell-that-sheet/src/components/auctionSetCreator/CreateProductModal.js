import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, VStack, Tooltip, Stack, Skeleton } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { matchCategory, getCategoryById } from 'contexts/AuthContext';
import { Radio, RadioGroup } from "@chakra-ui/react"
import { Button, ButtonGroup } from "@chakra-ui/react"
import { Input, InputGroup, InputRightElement, FormLabel, FormHelperText, FormErrorMessage, FormControl } from "@chakra-ui/react"
import { Text } from "@chakra-ui/react";
import { Form } from 'formik';
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

export const CreateProductModal = ({ isOpen, onClose, createProductFunction, folderChain, photos, latestCategories, setLatestCategories }) => {
    /// modal responsible for creating a product
    /// Elements: buttons with 5 latest categories (acting like radio select), top 5 best matching categories, input for category id, input for product name
    /// user should be able to select a category by clicking on a button or by typing in the input
    /// finally user should be able to click on a button to create a product
    /// the button should run a function passed as a prop with the selected category, product name, folderChain and photos as arguments
    /// the categories should be fetched from the API
    /// the best matching categories should be fetched from the API based on the product name
    const [categories, setCategories] = useState([]);
    const [bestMatchingCategories, setBestMatchingCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [productName, setProductName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingCategoriesError, setLoadingCategoriesError] = useState(false);

    const buildCategoryTree = (category) => {
        let categoryChain = [];
        let currentCategory = category;
        while (currentCategory !== null) {
            categoryChain.unshift(currentCategory.name);
            if (currentCategory.leaf) {
                break;
            }
            currentCategory = currentCategory.parent;
        }
        // create breadcrumb
        return <Breadcrumb display={'inline-block'} separator={<ChevronRightIcon color={'gray.500'} />}>
            {categoryChain.map((category) => (
                <BreadcrumbItem>
                    <Text>{category}</Text>
                </BreadcrumbItem>
            ))}
        </Breadcrumb>;
    }

    function getMatchingCategories() {
        setLoadingCategories(true);
        matchCategory(productName).then(data => {
            setBestMatchingCategories(data.slice(0, 5));
            setLoadingCategories(false);
        });
    }

    const matchCategoryId = (categoryId) => {
        // get category by id on error show error message
        setLoadingCategoriesError(false);
        setLoadingCategories(true);
        getCategoryById(categoryId).then(data => {
            setBestMatchingCategories([data]);
            setSelectedCategory(data);
            setLoadingCategories(false);
        }
        ).catch(() => {
            setLoadingCategoriesError(true);
            setLoadingCategories(false);
        });
    }

    useEffect(() => {
        setLoadingCategoriesError(false);
    }, [categoryId]);


    // useEffect(() => {
    //     matchCategory(productName).then(data => {
    //         // set top 5 best matching categories
    //         setBestMatchingCategories(data.slice(0, 5));
    //     });
    // }
    // , [productName]);

    useEffect(() => {
        setCategories(latestCategories);
    }
        , []);


    return (
        <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={true}>
            <ModalOverlay />
            <ModalContent minWidth={'1000px'}>
                <ModalHeader>Tworzenie produktu</ModalHeader>
                <ModalCloseButton onClick={onClose}/>
                <ModalBody>

                    <InputGroup size="md" flexDir={'column'}>
                        <FormControl>
                            <FormLabel as='legend'>Nazwa produktu</FormLabel>
                            <InputGroup>
                                <Input
                                    pr="4.5rem"
                                    type="text"
                                    placeholder="Nazwa produktu"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                                <InputRightElement width="4.5rem">
                                    <Tooltip label="Dopasuj kategorie do nazwy produktu">
                                        <Button onClick={getMatchingCategories} h='1.75rem' size='sm'>
                                            Dopasuj
                                        </Button>
                                    </Tooltip>
                                </InputRightElement>
                            </InputGroup>
                            <FormHelperText>Wpisz nazwę produktu aby automatycznie dopasować kategorie</FormHelperText>
                        </FormControl>
                    </InputGroup>
                    <InputGroup mt={'12px'} size="md" flexDir={'column'}>
                        <FormControl isInvalid={loadingCategoriesError}>
                            <FormLabel as='legend'>Numer kategorii</FormLabel>

                            <InputGroup>
                                <Input
                                    pr="4.5rem"
                                    type="text"
                                    placeholder="Id kategorii"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                />

                                <InputRightElement width="4.5rem">
                                    <Tooltip label="Wyszukaj kategorie po numerze">
                                        <Button onClick={() => matchCategoryId(categoryId)} h='1.75rem' size='sm'>
                                            Wyszukaj
                                        </Button>
                                    </Tooltip>
                                </InputRightElement>


                            </InputGroup>
                            {!loadingCategoriesError ? (
                                <FormHelperText>Wpisz numer kategorii jezeli dopasowanie nie zadziałało</FormHelperText>
                            ) : (
                                <FormErrorMessage>Nie znaleziono kategorii o podanym numerze</FormErrorMessage>
                            )}
                        </FormControl>

                    </InputGroup>
                    <ButtonGroup>
                        {categories.map((category) => (
                            <Button onClick={() => setSelectedCategory(category)}>{category.name}</Button>
                        ))}
                    </ButtonGroup>
                    <RadioGroup defaultValue={selectedCategory}>
                        {/* when loadingCategories show preloading stack instead */}
                        {loadingCategories &&
                            <Stack>
                                <Skeleton height="20px" />
                                <Skeleton height="20px" />
                                <Skeleton height="20px" />
                                <Skeleton height="20px" />
                                <Skeleton height="20px" />
                            </Stack>
                        }

                        {!loadingCategories && <VStack spacing={'12px'} align={'left'}>
                            {bestMatchingCategories.map((category) => (
                                <FormLabel onClick={() => setSelectedCategory(category)}>
                                    <Radio value={category.id}>{buildCategoryTree(category)} <Text ml='12px' as='em'>{category.id}</Text></Radio>
                                </FormLabel>
                            ))}
                        </VStack>
                        }
                    </RadioGroup>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='teal' onClick={() => createProductFunction(selectedCategory, productName, folderChain, photos)}>Dodaj produkt</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );


}