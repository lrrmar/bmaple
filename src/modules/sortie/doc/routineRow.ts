const routineRow = (
  i: string,
  description: string,
  duration: string,
  timeSoFar: string,
) => {
  return {
    'w:trPr': {
      'w:cantSplit': { '@_w:val': '0' },
      'w:tblHeader': { '@_w:val': '0' },
    },
    'w:tc': [
      {
        'w:tcPr': {
          'w:tcBorders': {
            'w:top': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:left': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:bottom': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:right': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
          },
          'w:vAlign': {
            '@_w:val': 'top',
          },
        },
        'w:p': {
          'w:pPr': {
            'w:keepNext': {
              '@_w:val': '0',
            },
            'w:keepLines': {
              '@_w:val': '0',
            },
            'w:pageBreakBefore': {
              '@_w:val': '0',
            },
            'w:widowControl': {
              '@_w:val': '1',
            },
            'w:numPr': {
              'w:ilvl': {
                '@_w:val': '0',
              },
              'w:numId': {
                '@_w:val': '1',
              },
            },
            'w:pBdr': {
              'w:top': {
                '@_w:space': '0',
                '@_w:sz': '0',
                '@_w:val': 'nil',
              },
              'w:left': {
                '@_w:space': '0',
                '@_w:sz': '0',
                '@_w:val': 'nil',
              },
              'w:bottom': {
                '@_w:space': '0',
                '@_w:sz': '0',
                '@_w:val': 'nil',
              },
              'w:right': {
                '@_w:space': '0',
                '@_w:sz': '0',
                '@_w:val': 'nil',
              },
              'w:between': {
                '@_w:space': '0',
                '@_w:sz': '0',
                '@_w:val': 'nil',
              },
            },
            'w:shd': {
              '@_w:fill': 'auto',
              '@_w:val': 'clear',
            },
            'w:spacing': {
              '@_w:after': '0',
              '@_w:before': '0',
              '@_w:line': '240',
              '@_w:lineRule': 'auto',
            },
            'w:ind': {
              '@_w:left': '720',
              '@_w:right': '0',
              '@_w:hanging': '360',
            },
            'w:jc': {
              '@_w:val': 'left',
            },
            'w:rPr': {
              'w:rFonts': {
                '@_w:ascii': 'Tahoma',
                '@_w:cs': 'Tahoma',
                '@_w:eastAsia': 'Tahoma',
                '@_w:hAnsi': 'Tahoma',
              },
              'w:b': {
                '@_w:val': '0',
              },
              'w:bCs': {
                '@_w:val': '0',
              },
              'w:i': {
                '@_w:val': '0',
              },
              'w:iCs': {
                '@_w:val': '0',
              },
              'w:smallCaps': {
                '@_w:val': '0',
              },
              'w:strike': {
                '@_w:val': '0',
              },
              'w:color': {
                '@_w:val': '000000',
              },
              'w:sz': {
                '@_w:val': '18',
              },
              'w:szCs': {
                '@_w:val': '18',
              },
              'w:u': {
                '@_w:val': 'none',
              },
              'w:shd': {
                '@_w:fill': 'auto',
                '@_w:val': 'clear',
              },
              'w:vertAlign': {
                '@_w:val': 'baseline',
              },
            },
          },
          'w:r': {
            'w:rPr': {
              'w:rtl': {
                '@_w:val': '0',
              },
            },
            'w:t': {
              '#text': `#${i}`,
              '@_xml:space': 'preserve',
            },
            '@_w:rsidDel': '00000000',
            '@_w:rsidR': '00000000',
            '@_w:rsidRPr': '00000000',
          },
          '@_w:rsidR': '00000000',
          '@_w:rsidDel': '00000000',
          '@_w:rsidP': '00000000',
          '@_w:rsidRDefault': '00000000',
          '@_w:rsidRPr': '00000000',
          '@_w14:paraId': '000000CC',
        },
      },
      {
        'w:tcPr': {
          'w:tcBorders': {
            'w:top': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:left': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:bottom': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:right': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
          },
          'w:vAlign': {
            '@_w:val': 'top',
          },
        },
        'w:p': [
          {
            'w:pPr': {
              'w:spacing': {
                '@_w:after': '0',
                '@_w:line': '240',
                '@_w:lineRule': 'auto',
              },
              'w:rPr': {
                'w:rFonts': {
                  '@_w:ascii': 'Tahoma',
                  '@_w:cs': 'Tahoma',
                  '@_w:eastAsia': 'Tahoma',
                  '@_w:hAnsi': 'Tahoma',
                },
                'w:i': {
                  '@_w:val': '0',
                },
                'w:iCs': {
                  '@_w:val': '0',
                },
                'w:color': {
                  '@_w:val': '000000',
                },
                'w:sz': {
                  '@_w:val': '20',
                },
                'w:szCs': {
                  '@_w:val': '20',
                },
                'w:vertAlign': {
                  '@_w:val': 'baseline',
                },
              },
            },
            'w:r': [
              {
                'w:rPr': {
                  'w:rFonts': {
                    '@_w:ascii': 'Tahoma',
                    '@_w:cs': 'Tahoma',
                    '@_w:eastAsia': 'Tahoma',
                    '@_w:hAnsi': 'Tahoma',
                  },
                  'w:i': {
                    '@_w:val': '1',
                  },
                  'w:iCs': {
                    '@_w:val': '1',
                  },
                  'w:color': {
                    '@_w:val': '000000',
                  },
                  'w:sz': {
                    '@_w:val': '20',
                  },
                  'w:szCs': {
                    '@_w:val': '20',
                  },
                  'w:vertAlign': {
                    '@_w:val': 'baseline',
                  },
                  'w:rtl': {
                    '@_w:val': '0',
                  },
                },
                'w:t': {
                  '#text': description,
                  '@_xml:space': 'preserve',
                },
                '@_w:rsidDel': '00000000',
                '@_w:rsidR': '00000000',
                '@_w:rsidRPr': '00000000',
              },
              {
                'w:rPr': {
                  'w:rtl': {
                    '@_w:val': '0',
                  },
                },
                '@_w:rsidDel': '00000000',
                '@_w:rsidR': '00000000',
                '@_w:rsidRPr': '00000000',
              },
            ],
            '@_w:rsidR': '00000000',
            '@_w:rsidDel': '00000000',
            '@_w:rsidP': '00000000',
            '@_w:rsidRDefault': '00000000',
            '@_w:rsidRPr': '00000000',
            '@_w14:paraId': '000000CD',
          },
        ],
      },
      {
        'w:tcPr': {
          'w:tcBorders': {
            'w:top': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:left': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:bottom': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:right': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
          },
          'w:vAlign': {
            '@_w:val': 'top',
          },
        },
        'w:p': {
          'w:pPr': {
            'w:spacing': {
              '@_w:after': '0',
              '@_w:line': '240',
              '@_w:lineRule': 'auto',
            },
            'w:jc': {
              '@_w:val': 'center',
            },
            'w:rPr': {
              'w:rFonts': {
                '@_w:ascii': 'Tahoma',
                '@_w:cs': 'Tahoma',
                '@_w:eastAsia': 'Tahoma',
                '@_w:hAnsi': 'Tahoma',
              },
              'w:i': {
                '@_w:val': '0',
              },
              'w:iCs': {
                '@_w:val': '0',
              },
              'w:color': {
                '@_w:val': '000000',
              },
              'w:sz': {
                '@_w:val': '20',
              },
              'w:szCs': {
                '@_w:val': '20',
              },
              'w:vertAlign': {
                '@_w:val': 'baseline',
              },
            },
          },
          'w:r': [
            {
              'w:rPr': {
                'w:rFonts': {
                  '@_w:ascii': 'Tahoma',
                  '@_w:cs': 'Tahoma',
                  '@_w:eastAsia': 'Tahoma',
                  '@_w:hAnsi': 'Tahoma',
                },
                'w:i': {
                  '@_w:val': '1',
                },
                'w:iCs': {
                  '@_w:val': '1',
                },
                'w:color': {
                  '@_w:val': '000000',
                },
                'w:sz': {
                  '@_w:val': '20',
                },
                'w:szCs': {
                  '@_w:val': '20',
                },
                'w:vertAlign': {
                  '@_w:val': 'baseline',
                },
                'w:rtl': {
                  '@_w:val': '0',
                },
              },
              'w:t': {
                '#text': duration,
                '@_xml:space': 'preserve',
              },
              '@_w:rsidDel': '00000000',
              '@_w:rsidR': '00000000',
              '@_w:rsidRPr': '00000000',
            },
            {
              'w:rPr': {
                'w:rtl': {
                  '@_w:val': '0',
                },
              },
              '@_w:rsidDel': '00000000',
              '@_w:rsidR': '00000000',
              '@_w:rsidRPr': '00000000',
            },
          ],
          '@_w:rsidR': '00000000',
          '@_w:rsidDel': '00000000',
          '@_w:rsidP': '00000000',
          '@_w:rsidRDefault': '00000000',
          '@_w:rsidRPr': '00000000',
          '@_w14:paraId': '000000D2',
        },
      },
      {
        'w:tcPr': {
          'w:tcBorders': {
            'w:top': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:left': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:bottom': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
            'w:right': {
              '@_w:color': '000000',
              '@_w:space': '0',
              '@_w:sz': '4',
              '@_w:val': 'single',
            },
          },
          'w:vAlign': {
            '@_w:val': 'top',
          },
        },
        'w:p': {
          'w:pPr': {
            'w:spacing': {
              '@_w:after': '0',
              '@_w:line': '240',
              '@_w:lineRule': 'auto',
            },
            'w:jc': {
              '@_w:val': 'center',
            },
            'w:rPr': {
              'w:rFonts': {
                '@_w:ascii': 'Tahoma',
                '@_w:cs': 'Tahoma',
                '@_w:eastAsia': 'Tahoma',
                '@_w:hAnsi': 'Tahoma',
              },
              'w:i': {
                '@_w:val': '0',
              },
              'w:iCs': {
                '@_w:val': '0',
              },
              'w:color': {
                '@_w:val': '000000',
              },
              'w:sz': {
                '@_w:val': '20',
              },
              'w:szCs': {
                '@_w:val': '20',
              },
              'w:vertAlign': {
                '@_w:val': 'baseline',
              },
            },
          },
          'w:r': [
            {
              'w:rPr': {
                'w:rFonts': {
                  '@_w:ascii': 'Tahoma',
                  '@_w:cs': 'Tahoma',
                  '@_w:eastAsia': 'Tahoma',
                  '@_w:hAnsi': 'Tahoma',
                },
                'w:i': {
                  '@_w:val': '1',
                },
                'w:iCs': {
                  '@_w:val': '1',
                },
                'w:color': {
                  '@_w:val': '000000',
                },
                'w:sz': {
                  '@_w:val': '20',
                },
                'w:szCs': {
                  '@_w:val': '20',
                },
                'w:vertAlign': {
                  '@_w:val': 'baseline',
                },
                'w:rtl': {
                  '@_w:val': '0',
                },
              },
              'w:t': {
                '#text': timeSoFar,
                '@_xml:space': 'preserve',
              },
              '@_w:rsidDel': '00000000',
              '@_w:rsidR': '00000000',
              '@_w:rsidRPr': '00000000',
            },
            {
              'w:rPr': {
                'w:rtl': {
                  '@_w:val': '0',
                },
              },
              '@_w:rsidDel': '00000000',
              '@_w:rsidR': '00000000',
              '@_w:rsidRPr': '00000000',
            },
          ],
          '@_w:rsidR': '00000000',
          '@_w:rsidDel': '00000000',
          '@_w:rsidP': '00000000',
          '@_w:rsidRDefault': '00000000',
          '@_w:rsidRPr': '00000000',
          '@_w14:paraId': '000000D3',
        },
      },
    ],
  };
};
export default routineRow;
