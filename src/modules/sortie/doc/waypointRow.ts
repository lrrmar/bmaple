const waypointRow = (id: string, coords: string) => {
    return{
    "w:trPr": {
        "w:cantSplit": {
            "@_w:val": "0"
        },
        "w:tblHeader": {
            "@_w:val": "0"
        }
    },
    "w:tc": [
        {
            "w:tcPr": {
                "w:vAlign": {
                    "@_w:val": "top"
                }
            },
            "w:p": {
                "w:pPr": {
                    "w:spacing": {
                        "@_w:after": "0",
                        "@_w:line": "240",
                        "@_w:lineRule": "auto"
                    },
                    "w:rPr": {
                        "w:rFonts": {
                            "@_w:ascii": "Tahoma",
                            "@_w:cs": "Tahoma",
                            "@_w:eastAsia": "Tahoma",
                            "@_w:hAnsi": "Tahoma"
                        },
                        "w:sz": {
                            "@_w:val": "20"
                        },
                        "w:szCs": {
                            "@_w:val": "20"
                        },
                        "w:vertAlign": {
                            "@_w:val": "baseline"
                        }
                    }
                },
                "w:r": [
                    {
                        "w:rPr": {
                            "w:rFonts": {
                                "@_w:ascii": "Tahoma",
                                "@_w:cs": "Tahoma",
                                "@_w:eastAsia": "Tahoma",
                                "@_w:hAnsi": "Tahoma"
                            },
                            "w:sz": {
                                "@_w:val": "20"
                            },
                            "w:szCs": {
                                "@_w:val": "20"
                            },
                            "w:rtl": {
                                "@_w:val": "0"
                            }
                        },
                        "w:t": {
                            "#text": id,
                            "@_xml:space": "preserve"
                        },
                        "@_w:rsidDel": "00000000",
                        "@_w:rsidR": "00000000",
                        "@_w:rsidRPr": "00000000"
                    },
                    {
                        "w:rPr": {
                            "w:rtl": {
                                "@_w:val": "0"
                            }
                        },
                        "@_w:rsidDel": "00000000",
                        "@_w:rsidR": "00000000",
                        "@_w:rsidRPr": "00000000"
                    }
                ],
                "@_w:rsidR": "00000000",
                "@_w:rsidDel": "00000000",
                "@_w:rsidP": "00000000",
                "@_w:rsidRDefault": "00000000",
                "@_w:rsidRPr": "00000000",
                "@_w14:paraId": "0000002B"
            }
        },
        {
            "w:tcPr": {
                "w:vAlign": {
                    "@_w:val": "top"
                }
            },
            "w:p": {
                "w:pPr": {
                    "w:spacing": {
                        "@_w:after": "0",
                        "@_w:line": "240",
                        "@_w:lineRule": "auto"
                    },
                    "w:rPr": {
                        "w:rFonts": {
                            "@_w:ascii": "Tahoma",
                            "@_w:cs": "Tahoma",
                            "@_w:eastAsia": "Tahoma",
                            "@_w:hAnsi": "Tahoma"
                        },
                        "w:sz": {
                            "@_w:val": "20"
                        },
                        "w:szCs": {
                            "@_w:val": "20"
                        },
                        "w:vertAlign": {
                            "@_w:val": "baseline"
                        }
                    }
                },
                "w:r": [
                    {
                        "w:rPr": {
                            "w:rFonts": {
                                "@_w:ascii": "Tahoma",
                                "@_w:cs": "Tahoma",
                                "@_w:eastAsia": "Tahoma",
                                "@_w:hAnsi": "Tahoma"
                            },
                            "w:sz": {
                                "@_w:val": "20"
                            },
                            "w:szCs": {
                                "@_w:val": "20"
                            },
                            "w:rtl": {
                                "@_w:val": "0"
                            }
                        },
                        "w:t": {
                            "#text": coords,
                            "@_xml:space": "preserve"
                        },
                        "@_w:rsidDel": "00000000",
                        "@_w:rsidR": "00000000",
                        "@_w:rsidRPr": "00000000"
                    },
                    {
                        "w:rPr": {
                            "w:rtl": {
                                "@_w:val": "0"
                            }
                        },
                        "@_w:rsidDel": "00000000",
                        "@_w:rsidR": "00000000",
                        "@_w:rsidRPr": "00000000"
                    }
                ],
                "@_w:rsidR": "00000000",
                "@_w:rsidDel": "00000000",
                "@_w:rsidP": "00000000",
                "@_w:rsidRDefault": "00000000",
                "@_w:rsidRPr": "00000000",
                "@_w14:paraId": "0000002C"
            }
        }
    ]
}

};
export default waypointRow;
