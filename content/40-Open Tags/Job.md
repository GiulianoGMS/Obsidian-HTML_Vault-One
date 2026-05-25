**Scheduling Programmed Tasks in Oracle PL/SQL**

[[Schedules]]:  São as programações agendadas no Oracle PL/SQL que permitem executar scripts em determinados intervalos de tempo.

**Exemplos**

* Executar uma rotina diariamente para atualizar os dados;
* Agendar uma tarefa semanal para processar arquivos grandes;
* Criar um script que seja executado todas as quartas-feiras à meia-noite;

Aqui está um exemplo de como criar uma [[schedule]] no Oracle PL/SQL:

```sql
BEGIN
  DBMS_SCHEDULER.CREATE_JOB(
    job_name        => 'MY_JOBS',
    job_type        => 'PLSQL_BLOCK',
    job_action      => 'BEGIN EXEC my_script; END;',
    start_date      => SYSTIMESTAMP,
    repeat_interval=> 'FREQ=DAILY; BYHOUR=8; BYMINUTE=0;',
    enabled         => TRUE
  );
END;
```

Nesse exemplo, estamos criando uma [[schedule]] que executará um script chamado `my_script` todas as quartas-feiras à 8h00.

As execuções dos Jobs/Schedules são monitorados pela rotina [[Whatsapp Bot.canvas]].