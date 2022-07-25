USAGE = '''
python read-fast.py <path to txt file> <words per minute> <line number to start at>
'''

import time
import sys
import argparse

max_word_length = 40

def sleep(wpm):
    # we add this function to make the code cleaner
    time.sleep(60./wpm)

parser = argparse.ArgumentParser(description='Read fast.')
parser.add_argument('infile', metavar='txtfile', type=str, help='the txt file you want to read')
parser.add_argument('wpm', metavar='wpm', type=float, help='how many words you want to read per minute')
parser.add_argument('line_begin', metavar='line', type=int, help='at which line of the txt file to start')
parser.add_argument('word_begin', metavar='word', type=int, nargs='?', help='at which word in the line to start', default=0)
args = parser.parse_args()

infile, wpm, line_begin, word_begin = args.infile, args.wpm, args.line_begin, args.word_begin

# reading that amount of lines is ok for book-sized data
with open(infile, 'r') as f:
    lines = f.readlines()

try:
    for line_counter, line in enumerate(lines[line_begin:], start=line_begin):
        line = line.strip().split()
        for word_counter, word in enumerate(line[word_begin:], start=word_begin):
            print(f'{word:^40} {line_counter:06d} {word_counter:06d}', end='\r')

            sleep(wpm)

            # after the word, we add extra waiting time in certain cases
            for _ in range(len(word.split('-'))):
                sleep(wpm)
            if len(word) > 8:
                sleep(wpm)
            if word.endswith('.') or word.endswith(','):
                sleep(wpm)


        word_begin = 0
    

except KeyboardInterrupt:
    # The current line is displayed when the script is canceled
    print(f'Interrupted at line {line_counter:06d}')

