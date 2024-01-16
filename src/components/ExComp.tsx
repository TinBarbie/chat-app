import React from 'react'
import { ChangeEvent, useEffect, useState } from "react";
import { useDebounce } from '../use-debounce.ts';

export const ExComp = () => {
    const [value, setValue] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const debouncedValue = useDebounce(value, 500)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
    }

    // Fetch API (optional)
    useEffect(() => {
        setSearchValue(debouncedValue)
    }, [debouncedValue])

    console.log(value);

    return (
        <>
            <div className="flex items-center justify-between w-[400px]">
                <label htmlFor="username" > Username: </label>
                <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Input username"
                    className="h-[60px] w-[250px] px-3"
                    onChange={(e) => { handleChange(e) }} />
            </div>
            <p>Search value: {searchValue}</p>
        </>
    )
}