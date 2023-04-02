import csv

chinese_words = []  # Create an empty list to store Chinese words

# Loop over the six CSV files
for i in range(1, 7):
    filename = f'HSK_Level_{i}_(New_HSK).csv'  # Generate the filename for the current iteration
    with open(filename, newline='', encoding='utf-8') as csvfile:
        datareader = csv.reader(csvfile)
        headers = next(datareader)
        third_column = [row[2] for row in datareader]

        # Loop over the third column and add any new Chinese words to the list
        for word in third_column:
            if '\u4e00' <= word <= '\u9fff' and word not in chinese_words:
                chinese_words.append(word)

# Create a list called chinese_characters that contains all characters appeared in chinese_words
chinese_characters = []
for word in chinese_words:
    for character in word:
        if character not in chinese_characters:
            chinese_characters.append(character)

# Print the list of Chinese characters
print(chinese_characters)

with open('chinese_characters.txt', mode='w', encoding='utf-8') as outfile:
    for character in chinese_characters:
        outfile.write(character + '\n')
