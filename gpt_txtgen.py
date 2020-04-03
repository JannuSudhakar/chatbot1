#requirements: huggingface's package that implements bert and gpt
#print('hi1')
#print('hi2')
import numpy as np
import torch
import os
import sys
sys.stdout = open(os.devnull, "w")
from pytorch_pretrained_bert import GPT2Tokenizer, GPT2Model, GPT2LMHeadModel
sys.stdout = sys.__stdout__
#print('hi3')

text = sys.argv[1]
#print("prompt text: ", text)

tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
#print('hi4')
#tokenized_text = tokenizer.tokenize(text)

#indexed_tokens = tokenizer.convert_tokens_to_ids(tokenized_text)

indexed_tokens = tokenizer.encode(text)
model = GPT2LMHeadModel.from_pretrained('gpt2')
#print('hi5')

out_tokens = []

for i in range(100):
    #print(i,end = "|",flush=True)
    tokens_tensor = torch.tensor([indexed_tokens])
    with torch.no_grad():
        predictions = model(tokens_tensor)[0]
    sampler = torch.distributions.categorical.Categorical(logits = 1*predictions[0,-1,:])
    predicted_index = sampler.sample().item()
    #predicted_index = torch.argmax(predictions[0,-1,:]).item()
    #print(torch.sum(predictions[0,-1,:]))
    indexed_tokens.append(predicted_index)

    if(predicted_index == 198):
        break
    out_tokens.append(predicted_index)

out_str = tokenizer.decode(out_tokens)
#for t in indexed_tokens:
#    out_str += tokenizer.convert_ids_to_tokens([t])[0]

#out_str = out_str.replace("</w>", " " )
print(out_str)
