from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline

model_name = "deepset/roberta-base-squad2"

# a) Get predictions
nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)
QA_input = {
    'question': 'Why is Advait bad?',
    'context': 'Advait is a bad boy because he does not listen to his mom.'
}
res = nlp(QA_input)
print(res)