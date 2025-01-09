import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Select,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Textarea,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { getFieldTranslationsDe } from 'contexts/AuthContext';  // or a more general 'getTranslation' if you have it

function capitalizeWords(text) {
  return text.replace(/\b\p{L}/gu, char => char.toLocaleUpperCase('de-DE'))
             .replace(/\B\p{L}/gu, char => char.toLocaleLowerCase('de-DE'));
}

function removeOpeningAndTrailingBr(input) {
  return input.replace(
    /^(<br\s*\/?>|<p>\s*<br\s*\/?>\s*<\/p>)+|(<br\s*\/?>|<p>\s*<br\s*\/?>\s*<\/p>)+$/gi,
    ''
  );
}

const FieldTranslationModal = ({
  isOpen,
  onClose,
  fields,
  currentValues,
  onApplyTranslations,
  category,
}) => {
  const [targetLanguage, setTargetLanguage] = useState('de');
  const [translations, setTranslations] = useState({});
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  const allowedFields = [
    'Nazwa',
    'Opis',
  ];

  // Helper to update a specific field's translation when user modifies it
  const handleTranslationChange = (fieldName, newValue) => {
    setTranslations((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  const handleTranslate = async () => {
    setLoadingTranslation(true);
    try {
      // Collect only string/textarea fields to pass for translation
      const translateObject = {};
      fields
        .filter((f) => allowedFields.includes(f.displayName || f.name))
        .forEach((f) => {
          if (f.type === 'string' || f.type === 'textarea') {
            translateObject[f.name] = currentValues[f.name];
          }
        });

      // Call your translation API
      const response = await getFieldTranslationsDe(translateObject);

      // Build newTranslations object: match each field to its returned translation
      const newTranslations = {};
      fields.forEach((f) => {
        if (f.name === 'name') {
          newTranslations[f.name] = capitalizeWords(response.translation['title'] || '');
        } else {
          newTranslations[f.name] = removeOpeningAndTrailingBr(response.translation[f.name] || '');
        }
      });

      setTranslations(newTranslations);
      toast.success('Zakończono tłumaczenie!');
    } catch (error) {
      console.error(error);
      toast.error('Błąd podczas tłumaczenia');
    } finally {
      setLoadingTranslation(false);
    }
  };

  const handleApply = () => {
    // Pass the final translations back to the parent form
    onApplyTranslations(translations, targetLanguage);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tłumaczenie pól</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Select
            placeholder="Wybierz język"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            mb={3}
          >
            <option value="de">Niemiecki</option>
            {/* <option value="en">Angielski</option> */}
            {/* <option value="pl">Polski</option> */}
          </Select>

          <Button
            loadingText="Tłumaczenie"
            isLoading={loadingTranslation}
            colorScheme="blue"
            size="sm"
            onClick={handleTranslate}
            mb={3}
          >
            Tłumacz Wszystko
          </Button>

          <Table size="sm">
            <thead>
              <Tr>
                <Th>Pole</Th>
                <Th>Aktualna wartość</Th>
                <Th>Tłumaczenie</Th>
              </Tr>
            </thead>
            <Tbody>
              {fields
                .filter((f) => allowedFields.includes(f.displayName || f.name))
                .map((f) => (
                  <Tr key={f.id}>
                    <Td>{f.displayName || f.name}</Td>

                    {/* Show original value (HTML or plain text) */}
                    <Td dangerouslySetInnerHTML={{ __html: currentValues[f.name] }} />

                    {/* Editable translation field */}
                    <Td width="40%">
                      <Textarea
                        rows={4}
                        value={translations[f.name] || ''}
                        onChange={(e) => handleTranslationChange(f.name, e.target.value)}
                        placeholder="Tłumaczenie..."
                      />
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Anuluj
          </Button>
          <Button colorScheme="blue" onClick={handleApply}>
            Dodaj Tłumaczenia
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FieldTranslationModal;
