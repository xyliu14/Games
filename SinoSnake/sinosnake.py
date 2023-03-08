import pygame, sys, random, re, pypinyin
from pygame.math import Vector2
from pypinyin import pinyin, Style

class SNAKE:
    def __init__(self):
        self.body = [Vector2(5,10), Vector2(4,10), Vector2(3,10)]
        self.direction = Vector2(0,0)
        self.new_block = False
    
        self.head_up = pygame.image.load('Graphics/head_up.png').convert_alpha()
        self.head_down = pygame.image.load('Graphics/head_down.png').convert_alpha()
        self.head_right = pygame.image.load('Graphics/head_right.png').convert_alpha()
        self.head_left = pygame.image.load('Graphics/head_left.png').convert_alpha()
		
        self.tail_up = pygame.image.load('Graphics/tail_up.png').convert_alpha()
        self.tail_down = pygame.image.load('Graphics/tail_down.png').convert_alpha()
        self.tail_right = pygame.image.load('Graphics/tail_right.png').convert_alpha()
        self.tail_left = pygame.image.load('Graphics/tail_left.png').convert_alpha()

        self.body_vertical = pygame.image.load('Graphics/body_vertical.png').convert_alpha()
        self.body_horizontal = pygame.image.load('Graphics/body_horizontal.png').convert_alpha()

        self.body_tr = pygame.image.load('Graphics/body_tr.png').convert_alpha()
        self.body_tl = pygame.image.load('Graphics/body_tl.png').convert_alpha()
        self.body_br = pygame.image.load('Graphics/body_br.png').convert_alpha()
        self.body_bl = pygame.image.load('Graphics/body_bl.png').convert_alpha()
        self.crunch_sound = pygame.mixer.Sound('Sound/crunch.wav')

    def draw_snake(self):
        self.update_head_graphics()
        self.update_tail_graphics()

        for index,block in enumerate(self.body):
            x_pos = int(block.x * cell_size)
            y_pos = int(block.y * cell_size)
            block_rect = pygame.Rect(x_pos, y_pos, cell_size, cell_size)
        
            if index == 0:
                screen.blit(self.head, block_rect)
            elif index == len(self.body) - 1:
                screen.blit(self.tail, block_rect)
            else:
                previous_block = self.body[index + 1] - block
                next_block = self.body[index -1] - block
                if previous_block.y == next_block.y: 
                    screen.blit(self.body_horizontal, block_rect)
                elif previous_block.x == next_block.x:
                    screen.blit(self.body_vertical, block_rect)
                else:
                    if previous_block.x == -1 and next_block.y == -1 or previous_block.y == -1 and next_block.x == -1:
                        screen.blit(self.body_tl, block_rect)
                    elif previous_block.x == -1 and next_block.y == 1 or previous_block.y == 1 and next_block.x == -1:
                        screen.blit(self.body_bl, block_rect)
                    elif previous_block.x == 1 and next_block.y == -1 or previous_block.y == -1 and next_block.x == 1:
                        screen.blit(self.body_tr, block_rect)
                    elif previous_block.x == 1 and next_block.y == 1 or previous_block.y == 1 and next_block.x == 1:
                        screen.blit(self.body_br, block_rect)

    def update_head_graphics(self):
        head_relation = self.body[1] - self.body[0]
        if head_relation == Vector2(1,0): self.head = self.head_left
        elif head_relation == Vector2(-1,0): self.head = self.head_right
        elif head_relation == Vector2(0,1): self.head = self.head_up
        elif head_relation == Vector2(0,-1): self.head = self.head_down
    
    def update_tail_graphics(self):
        tail_relation = self.body[-2] - self.body[-1]
        if tail_relation == Vector2(1,0): self.tail = self.tail_left
        elif tail_relation == Vector2(-1,0): self.tail = self.tail_right
        elif tail_relation == Vector2(0,1): self.tail = self.tail_up
        elif tail_relation == Vector2(0,-1): self.tail = self.tail_down
    
    def move_snake(self):
        if self.new_block == True:
            body_copy = self.body[:]
            body_copy.insert(0,body_copy[0] + self.direction)
            self.body = body_copy[:]
            self.new_block = False
        else:
            body_copy = self.body[:-1]
            body_copy.insert(0,body_copy[0] + self.direction)
            self.body = body_copy[:]

    def add_block(self):
        self.new_block = True
    
    def play_sound(self):
        self.crunch_sound.play()
    
    def reset(self):
        self.body = [Vector2(5,10),Vector2(4,10),Vector2(3,10)]
        self.direction = Vector2(0,0)

class ZIMU: 
    def __init__(self):
        self.randomize()
    
    def draw_zimu(self):
        zimu_text = self.zimu
        zimu_surface = zimu_font.render(zimu_text, True, (56,74,12))
        zimu_rect = pygame.Rect(int(self.pos.x * cell_size), int(self.pos.y * cell_size), cell_size, cell_size)
        screen.blit(zimu_surface, zimu_rect)
        
    def randomize(self):
        self.x = random.randint(0,cell_number - 1)
        self.y = random.randint(0,cell_number - 2)     # zimu cannot be covered by score so self.y excludes the last row
        self.pos = Vector2(self.x, self.y)
        if zimu_eaten in zimu_cons and zimu_eaten != "":         # if cons then next would be vowel
            self.zimu = random.choice(zimu_vowels)
        elif zimu_eaten in zimu_vowels and zimu_eaten != "":     # vice versa
            self.zimu = random.choice(zimu_cons)
        else:
            self.zimu = random.choice(zimu_list)
    
    def get_zimu(self):
        return self.zimu


class MAIN:
    def __init__(self):
        self.snake = SNAKE()
        self.zimus = []
        for i in range(zimu_amount):
            self.zimus.append(ZIMU())
    
    def update(self):
        self.snake.move_snake()
        self.check_collision()
        self.check_fail()
    
    def draw_elements(self):
        self.draw_grass()
        for i in range(zimu_amount):
            self.zimus[i].draw_zimu()
        self.snake.draw_snake()
        self.draw_score()
        self.update_level()

    def draw_grass(self):
        grass_color = (248,232,193)
        for col in range (cell_number):
            if col % 2 == 0:
                for row in range(cell_number):
                    if row % 2 == 0:
                        grass_rect = pygame.Rect(col * cell_size, row * cell_size, cell_size, cell_size)
                        pygame.draw.rect(screen, grass_color, grass_rect)
            else:
                for row in range(cell_number):
                    if row % 2 != 0:
                        grass_rect = pygame.Rect(col * cell_size, row * cell_size, cell_size, cell_size)
                        pygame.draw.rect(screen, grass_color, grass_rect)

    def check_collision(self):
        global zimu_score
        global zimu_eaten
        for i in range(zimu_amount):
            if self.zimus[i].pos == self.snake.body[0]:
                zimu_eaten = self.zimus[i].get_zimu()
                zimu_score.append(zimu_eaten)
                for j in range(zimu_amount):                    # reposition zimu by random
                    if random.randint(0,1) == 1:
                        self.zimus[j].randomize()              
                self.snake.add_block()
                self.snake.play_sound()
            
            for block in self.snake.body[1:]:
                if block == self.zimus[i].pos:
                    self.zimus[i].randomize()
            
            zimu_pos = []
            for posit in range(zimu_amount):                    # check if zimu spwans on existing zimu
                zimu_pos.append(self.zimus[posit].pos)
            for posit in range(zimu_amount):
                if self.zimus[posit].pos in zimu_pos[posit+1:]:
                    print(zimu_pos)
                    self.zimus[posit].randomize()
    
    def check_fail(self):
        if not 0 <= self.snake.body[0].x < cell_number or not 0 <= self.snake.body[0].y < cell_number:
            self.game_over()
        for block in self.snake.body[1:]:
            if block == self.snake.body[0]:
                self.game_over()
        if len(zimu_score) == cell_number:
            self.game_over()
    
    def game_over(self):
        self.snake.reset()
        zimu_score.clear()
        self.zimu_reset()
    
    def draw_score(self):
        global zimu_score

        zimu_x = int(cell_size * cell_number % 2)
        zimu_y = int(cell_size * cell_number - 40)
        bg_rect = pygame.Rect(zimu_x, zimu_y, cell_size * cell_number, cell_size)
        pygame.draw.rect(screen,(167,209,61),bg_rect)
        
        target_pinyin = ""
        for i in range(len(zimu_score)-level):
            target_pinyin = ''.join(zimu_score[i:i+level+1])  # use join() to convert list to str
            if target_pinyin in pinyin_list:
                for j in range(level+1):
                    zimu_score.pop()
                hanzi_index = pinyin_list.index(target_pinyin)
                zimu_score.append(hanzi_list[hanzi_index])
                target_pinyin = ""

        for j in range(len(zimu_score)):
            zimu_rect = pygame.Rect(zimu_x, zimu_y, cell_size, cell_size)
            if re.search("[\u4e00-\u9FFF]", zimu_score[j]):             # check if the target word is chinese or letter 
                test_surface = hanzi_font.render(zimu_score[j], True, (56,74,12))
            else:
                test_surface = zimu_font.render(zimu_score[j], True, (56,74,12))
            screen.blit(test_surface, zimu_rect)
            zimu_x += 40
    
    def update_level(self):
        global level
        hanzi_amount = 0
        for i in range(len(zimu_score)):
            if re.search("[\u4e00-\u9FFF]", zimu_score[i]): 
                hanzi_amount += 1
                if hanzi_amount == level_goal:
                    #self.paused()
                    level += 1
                    hanzi_amount = 0
                    zimu_score.clear()
        level_text = str(level+1)
        level_surface = zimu_font.render(level_text + "letter(s)", True, (56,74,12))
        level_rect = pygame.Rect(int(cell_size * cell_number - 180), int(cell_size * cell_number - 120), cell_size, cell_size)
        screen.blit(level_surface, level_rect)
    
    def zimu_reset(self):
        global zimu_amount
        global level
        level = 1
        zimu_amount = 5
    
    # def paused(self):
    #     i = 10
    #     while i > 0:
    #         for event in pygame.event.get():
    #             if event.type == pygame.QUIT:
    #                 pygame.quit()
    #                 quit()
    #         #pygame.display.update()
    #         clock.tick(game_speed)
    #         i -= 1


pygame.mixer.pre_init(44100,-16,2,512)
pygame.init()
cell_size = 40
cell_number = 20
zimu_amount = 5
level = 1
level_goal = 2
zimu_eaten = ""

# game_display = pygame.Surface((cell_number*cell_size, cell_number*cell_size))
screen = pygame.display.set_mode((cell_number * cell_size, cell_number * cell_size))

clock = pygame.time.Clock()

hanzi_list = open("3500hanzi.txt","r").read().replace('\n','')
# when converted to str, pinyin starts at [2] because [0] is [ and [1] is ', as in ['yī']
pinyin_file = open("3500pinyin.txt","r").read()
pinyin_list = pinyin_file.split(" ")
zimu_list = sorted(open("allpinyin.txt","r").read())
zimu_vowels = "ōeěēíáǘaǜūuǎiǒüǐā"
zimu_cons = "cysjptfdwqbhnzmgr"
# 0.7 for vowels and 2.3 for cons

zimu_score = []                 # stores the eaten zimu

zimu_font = pygame.font.Font('Font/Baloo2-VariableFont_wght.ttf', 30)
hanzi_font = pygame.font.Font('Font/ZCOOLKuaiLe-Regular.ttf', 30)
game_speed = 60

SCREEN_UPDATE = pygame.USEREVENT
pygame.time.set_timer(SCREEN_UPDATE,150)

main_game = MAIN()

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if event.type == SCREEN_UPDATE:
            main_game.update()
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_w:
                if main_game.snake.direction.y != 1:
                    main_game.snake.direction = Vector2(0,-1)
            if event.key == pygame.K_s:
                if main_game.snake.direction.y != -1:
                    main_game.snake.direction = Vector2(0,1)
            if event.key == pygame.K_a:
                if main_game.snake.direction.x != 1:
                    main_game.snake.direction = Vector2(-1,0)
            if event.key == pygame.K_d:
                if main_game.snake.direction.x != -1:
                    main_game.snake.direction = Vector2(1,0)

    screen.fill((249, 241, 219))
    main_game.draw_elements()
    pygame.display.update()
    clock.tick(game_speed)