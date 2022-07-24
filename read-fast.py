USAGE = '''
python read-fast.py <path to txt file> <words per minute> <line number to start at>
'''

import time
import sys
import argparse

parser = argparse.ArgumentParser(description='Read fast.')
parser.add_argument('infile', metavar='txtfile', type=str, nargs=1, help='the txt file you want to read')
parser.add_argument('wpm', metavar='wpm', type=float, nargs=1, help='how many words you want to read per minute')
parser.add_argument('line_begin', metavar='line', type=int, nargs=1, help='at which line of the txt file to start')

args = parser.parse_args()

infile, wpm, line_begin = args.infile[0], args.wpm[0], args.line_begin[0]

# reading that amount of lines is ok for book-sized data
with open(infile, 'r') as f:
    lines = f.readlines()

try:
    for line_counter, line in enumerate(lines[line_begin:], start=line_begin):
        line = line.strip().split()
        for word_counter, word in line:
            print(f'{word:^40} {line_counter:06d} {word_counter:06d}', end='\r')
            if word.endswith('.') or word.endswith(','):
                time.sleep(60./wpm)
    
            if len(word) > 8:
                time.sleep(60./wpm)
    
    
            time.sleep(60./wpm)

except KeyboardInterrupt:
    print(f'Interrupted at line {line_counter:06d}')

