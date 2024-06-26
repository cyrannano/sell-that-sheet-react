import React, { useState } from 'react';
import { ReactGrid, Column, Row } from '@silevis/reactgrid';

const MyReactGrid = () => {
    const [ isDropdownOpen, setIsDropdownOpen ] = useState(false);
    const [rows, setRows] = useState([
        {
            rowId: 1,
            cells: [
                { type: 'text', text: 'Item 1' },
                {
                    type: 'dropdown',
                    // value: 'Option 1',
                    values: [
                        { value: 'Option 1', label: 'Option 1' },
                        { value: 'Option 2', label: 'Option 2' },
                        { value: 'Option 3', label: 'Option 3' }
                    ],
                    isOpen: isDropdownOpen
                }
            ]
        },
        {
            rowId: 2,
            cells: [
                { type: 'text', text: 'Item 2' },
                {
                    type: 'dropdown',
                    // value: 'Option 2',
                    values: [
                        { value: 'Option 1', label: 'Option 1' },
                        { value: 'Option 2', label: 'Option 2' },
                        { value: 'Option 3', label: 'Option 3' }
                    ],
                    isOpen: isDropdownOpen
                }
            ]
        }
    ]);

    const columns = [
        { columnId: 'col1', width: 150 },
        { columnId: 'col2', width: 150 }
    ];

    const handleChanges = (changes) => {
        changes.forEach((change) => {
            setIsDropdownOpen(change.newCell.isOpen);
        })

        
    };

    return (
        <ReactGrid
            rows={rows}
            columns={columns}
            onCellsChanged={handleChanges}
        />
    );
};

export default MyReactGrid;
