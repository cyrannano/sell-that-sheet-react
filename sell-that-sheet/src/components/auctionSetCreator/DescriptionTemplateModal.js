import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  List,
  ListItem,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';


const DescriptionTemplateModal = ({ isOpen, onClose, templates, setFieldValue, fieldName }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
  
    const handleTemplateSelect = (template) => {
      setSelectedTemplate(template);
    };
  
    const applyTemplate = () => {
      if (selectedTemplate) {
        setFieldValue(fieldName, selectedTemplate.content || '');
        onClose();
      } else {
        alert('Wybierz szablon aby kontynuować.');
      }
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Wybierz szablon opisu</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxHeight={'300px'} overflowY={'scroll'}>
            <List spacing={3}>
              {templates.map((template, index) => (
                <ListItem
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  cursor="pointer"
                  bg={selectedTemplate?.id === template.id ? 'blue.100' : 'white'}
                  _hover={{ bg: 'blue.50' }}
                  p={2}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontWeight="bold">{template.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {template.content.slice(0, 50)}...
                  </Text>
                </ListItem>
              ))}
            </List>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={applyTemplate}>
              Wstaw
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Anuluj
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default DescriptionTemplateModal;